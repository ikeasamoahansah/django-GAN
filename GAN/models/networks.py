import torch
import torch.nn as nn
from torch.nn import init
import functools
from torch.optim import lr_scheduler
# from .spectralNormalization import SpectralNorm
import torch.nn.functional as F
from torch import nn, einsum
from einops import rearrange, reduce, repeat
# from .SA import SelfAttention

###############################################################################
# Helper Functions
###############################################################################


def get_norm_layer(norm_type='instance'):
    if norm_type == 'batch':
        norm_layer = functools.partial(nn.BatchNorm2d, affine=True)
    elif norm_type == 'instance':
        norm_layer = functools.partial(nn.InstanceNorm2d, affine=False, track_running_stats=False)
    elif norm_type == 'none':
        norm_layer = None
    else:
        raise NotImplementedError('normalization layer [%s] is not found' % norm_type)
    return norm_layer


def get_scheduler(optimizer, opt):
    if opt.lr_policy == 'lambda':
        def lambda_rule(epoch):
            lr_l = 1.0 - max(0, epoch + opt.epoch_count - opt.niter) / float(opt.niter_decay + 1)
            return lr_l
        scheduler = lr_scheduler.LambdaLR(optimizer, lr_lambda=lambda_rule)
    elif opt.lr_policy == 'step':
        scheduler = lr_scheduler.StepLR(optimizer, step_size=opt.lr_decay_iters, gamma=0.1)
    elif opt.lr_policy == 'plateau':
        scheduler = lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.2, threshold=0.01, patience=5)
    elif opt.lr_policy == 'cosine':
        scheduler = lr_scheduler.CosineAnnealingLR(optimizer, T_max=opt.niter, eta_min=0)
    else:
        return NotImplementedError('learning rate policy [%s] is not implemented', opt.lr_policy)
    return scheduler


def init_weights(net, init_type='normal', gain=0.02):
    def init_func(m):
        classname = m.__class__.__name__
        if hasattr(m, 'weight') and (classname.find('Conv') != -1 or classname.find('Linear') != -1):
            if init_type == 'normal':
                init.normal_(m.weight.data, 0.0, gain)
            elif init_type == 'xavier':
                init.xavier_normal_(m.weight.data, gain=gain)
            elif init_type == 'kaiming':
                init.kaiming_normal_(m.weight.data, a=0, mode='fan_in')
            elif init_type == 'orthogonal':
                init.orthogonal_(m.weight.data, gain=gain)
            else:
                raise NotImplementedError('initialization method [%s] is not implemented' % init_type)
            if hasattr(m, 'bias') and m.bias is not None:
                init.constant_(m.bias.data, 0.0)
        elif classname.find('BatchNorm2d') != -1:
            init.normal_(m.weight.data, 1.0, gain)
            init.constant_(m.bias.data, 0.0)

    print('initialize network with %s' % init_type)
    net.apply(init_func)


def init_net(net, init_type='normal', init_gain=0.02, gpu_ids=[]):
    if len(gpu_ids) > 0:
        assert(torch.cuda.is_available())
        net.to(gpu_ids[0])
        net = torch.nn.DataParallel(net, gpu_ids)
    init_weights(net, init_type, gain=init_gain)
    return net


def define_G(input_nc, output_nc, ngf, netG, norm='batch', use_dropout=False, init_type='normal', init_gain=0.02, gpu_ids=[], use_attention=False):
    net = None
    norm_layer = get_norm_layer(norm_type=norm)

    if netG == 'resnet_15blocks':
        net = ResnetGenerator(input_nc, output_nc, ngf, norm_layer=norm_layer, use_dropout=use_dropout, n_blocks=15, use_attention=use_attention)
    elif netG == 'resnet_9blocks':
        net = ResnetGenerator(input_nc, output_nc, ngf, norm_layer=norm_layer, use_dropout=use_dropout, n_blocks=9, use_attention=use_attention)
    elif netG == 'resnet_6blocks':
        net = ResnetGenerator(input_nc, output_nc, ngf, norm_layer=norm_layer, use_dropout=use_dropout, n_blocks=6, use_attention=use_attention)
    elif netG == 'unet_128':
        net = UnetGenerator(input_nc, output_nc, 7, ngf, norm_layer=norm_layer, use_dropout=use_dropout)
    elif netG == 'unet_256':
        net = UnetGenerator(input_nc, output_nc, 8, ngf, norm_layer=norm_layer, use_dropout=use_dropout)
    elif netG == 'HPB':
        net = HPBGenerator(input_nc, output_nc, ngf, norm_layer=norm_layer, use_dropout=use_dropout, n_blocks=9)
    else:
        raise NotImplementedError('Generator model name [%s] is not recognized' % netG)
    return init_net(net, init_type, init_gain, gpu_ids)


def define_D(
    input_nc, 
    ndf, 
    netD,
    n_layers_D=3,
    norm='batch', 
    use_sigmoid=False, 
    init_type='normal', 
    init_gain=0.02, 
    gpu_ids=[],
    use_attention=False
):
    net = None
    if norm=="spectral":
        if netD == 'basic':
            # net = NLayerDiscriminatorSN(input_nc, ndf, n_layers=3, use_sigmoid=use_sigmoid, use_attention=use_attention)
            pass
        elif netD == 'n_layers':
            # net = NLayerDiscriminatorSN(
            #     input_nc, ndf, n_layers_D,
            #     use_sigmoid=use_sigmoid, use_attention=use_attention
            # )
            pass
    else:
        norm_layer = get_norm_layer(norm_type=norm)
        if netD == 'basic':
            net = NLayerDiscriminator(input_nc, ndf, n_layers=3, norm_layer=norm_layer, use_sigmoid=use_sigmoid, use_attention=use_attention)
        elif netD == 'n_layers':
            net = NLayerDiscriminator(input_nc, ndf, n_layers_D, norm_layer=norm_layer, use_sigmoid=use_sigmoid, use_attention=use_attention)
        elif netD == 'pixel':
            net = PixelDiscriminator(input_nc, ndf, norm_layer=norm_layer, use_sigmoid=use_sigmoid)
        else:
            raise NotImplementedError('Discriminator model name [%s] is not recognized' % net)
    return init_net(net, init_type, init_gain, gpu_ids)


##############################################################################
# Classes
##############################################################################


# Defines the GAN loss which uses either LSGAN or the regular GAN.
# When LSGAN is used, it is basically same as MSELoss,
# but it abstracts away the need to create the target label tensor
# that has the same size as the input
class GANLoss(nn.Module):
    def __init__(self, use_lsgan=True, target_real_label=1.0, target_fake_label=0.0):
        super(GANLoss, self).__init__()
        self.register_buffer('real_label', torch.tensor(target_real_label))
        self.register_buffer('fake_label', torch.tensor(target_fake_label))
        if use_lsgan:
            self.loss = nn.MSELoss()
        else:
            self.loss = nn.BCELoss()
    def get_target_tensor(self, input, target_is_real):
        if target_is_real:
            target_tensor = self.real_label
        else:
            target_tensor = self.fake_label
        return target_tensor.expand_as(input)

    def __call__(self, input, target_is_real):
        target_tensor = self.get_target_tensor(input, target_is_real)
        return self.loss(input, target_tensor)

#################################################################################
#                    Critic Loss for Wassertein Gan GP                          #
#################################################################################
class GradPenalty(nn.Module):
    def __init__(self, use_cuda):
        super(GradPenalty, self).__init__()
        self.use_cuda = use_cuda
    def forward(self, critic, real_data, fake_data):
        alpha = torch.rand_like(real_data)

        assignGPU = lambda x: x.cuda() if self.use_cuda else x
        alpha = assignGPU(alpha)

        interpolates = alpha*real_data + (1-alpha)*fake_data.detach()
        interpolates = assignGPU(interpolates)
        interpolates = torch.autograd.Variable(interpolates, requires_grad = True)

        critic_interpolates = critic(interpolates)

        gradients = torch.autograd.grad(
            outputs=critic_interpolates, 
            inputs=interpolates,
            grad_outputs=assignGPU(torch.ones(critic_interpolates.size())),
            create_graph=True, retain_graph=True, only_inputs=True
        )[0]
        gradients = gradients.view(gradients.size(0), -1)
        gradient_penalty = ((gradients.norm(2, dim=1)-1)**2).mean()
        return gradient_penalty

#####
#####

#################################################################################
#                   Hybrid Perception Block and DPSA LAyer                      #
#################################################################################


# helper functions

def exists(val):
    return val is not None

def default(val, d):
    return val if exists(val) else d

def l2norm(t):
    return F.normalize(t, dim = -1)

# helper classes

class Residual(nn.Module):
    def __init__(self, fn):
        super().__init__()
        self.fn = fn

    def forward(self, x, **kwargs):
        return self.fn(x, **kwargs) + x

class ChanLayerNorm(nn.Module):
    def __init__(self, dim, eps = 1e-5):
        super().__init__()
        self.eps = eps
        self.g = nn.Parameter(torch.ones(1, dim, 1, 1))
        self.b = nn.Parameter(torch.zeros(1, dim, 1, 1))

    def forward(self, x):
        var = torch.var(x, dim = 1, unbiased = False, keepdim = True)
        mean = torch.mean(x, dim = 1, keepdim = True)
        return (x - mean) / (var + self.eps).sqrt() * self.g + self.b

# classes

class HPB(nn.Module):
    """ Hybrid Perception Block """

    def __init__(
        self,
        dim,
        dim_head = 32,
        heads = 8,
        ff_mult = 4,
        attn_height_top_k = 8,
        attn_width_top_k = 8,
        attn_dropout = 0.,
        ff_dropout = 0.
    ):
        super().__init__()

        self.attn = DPSA(
            dim = dim,
            heads = heads,
            dim_head = dim_head,
            height_top_k = attn_height_top_k,
            width_top_k = attn_width_top_k,
            dropout = attn_dropout
        )

        self.dwconv = nn.Conv2d(dim, dim, 3, padding = 1, groups = dim)
        self.attn_parallel_combine_out = nn.Conv2d(dim * 2, dim, 1)

        ff_inner_dim = dim * ff_mult

        self.ff = nn.Sequential(
            nn.Conv2d(dim, ff_inner_dim, 1),
            nn.InstanceNorm2d(ff_inner_dim),
            nn.GELU(),
            nn.Dropout(ff_dropout),
            Residual(nn.Sequential(
                nn.Conv2d(ff_inner_dim, ff_inner_dim, 3, padding = 1, groups = ff_inner_dim),
                nn.InstanceNorm2d(ff_inner_dim),
                nn.GELU(),
                nn.Dropout(ff_dropout)
            )),
            nn.Conv2d(ff_inner_dim, dim, 1),
            nn.InstanceNorm2d(ff_inner_dim)
        )

    def forward(self, x):
        attn_branch_out = self.attn(x)
        conv_branch_out = self.dwconv(x)

        concatted_branches = torch.cat((attn_branch_out, conv_branch_out), dim = 1)
        attn_out = self.attn_parallel_combine_out(concatted_branches) + x

        return self.ff(attn_out)

class DPSA(nn.Module):
    """ Dual-pruned Self-attention Block """

    def __init__(
        self,
        dim,
        height_top_k = 8,
        width_top_k = 8,
        dim_head = 32,
        heads = 8,
        dropout = 0.
    ):
        super().__init__()
        self.heads = heads
        self.dim_head = dim_head
        self.scale = dim_head ** -0.5
        inner_dim = heads * dim_head

        self.norm = ChanLayerNorm(dim)
        self.to_qkv = nn.Conv2d(dim, inner_dim * 3, 1, bias = False)

        self.height_top_k = height_top_k
        self.width_top_k = width_top_k

        self.dropout = nn.Dropout(dropout)
        self.to_out = nn.Conv2d(inner_dim, dim, 1)

    def forward(self, x):
        b, c, h, w = x.shape

        x = self.norm(x)

        q, k, v = self.to_qkv(x).chunk(3, dim = 1)

        # fold out heads

        q, k, v = map(lambda t: rearrange(t, 'b (h c) x y -> (b h) c x y', h = self.heads), (q, k, v))

        # they used l2 normalized queries and keys, cosine sim attention basically

        q, k = map(l2norm, (q, k))

        # calculate whether to select and rank along height and width

        need_height_select_and_rank = self.height_top_k < h
        need_width_select_and_rank = self.width_top_k < w

        # select and rank keys / values, probing with query (reduced along height and width) and keys reduced along row and column respectively

        if need_width_select_and_rank or need_height_select_and_rank:
            q_probe = reduce(q, 'b h w d -> b d', 'sum')

        # gather along height, then width

        if need_height_select_and_rank:
            k_height = reduce(k, 'b h w d -> b h d', 'sum')

            top_h_indices = einsum('b d, b h d -> b h', q_probe, k_height).topk(k = self.height_top_k, dim = -1).indices

            top_h_indices = repeat(top_h_indices, 'b h -> b h w d', d = self.dim_head, w = k.shape[-2])

            k, v = map(lambda t: t.gather(1, top_h_indices), (k, v)) # first gather across height

        if need_width_select_and_rank:
            k_width = reduce(k, 'b h w d -> b w d', 'sum')

            top_w_indices = einsum('b d, b w d -> b w', q_probe, k_width).topk(k = self.width_top_k, dim = -1).indices

            top_w_indices = repeat(top_w_indices, 'b w -> b h w d', d = self.dim_head, h = k.shape[1])

            k, v = map(lambda t: t.gather(2, top_w_indices), (k, v)) # then gather along width

        # select the appropriate keys and values

        q, k, v = map(lambda t: rearrange(t, 'b ... d -> b (...) d'), (q, k, v))

        # cosine similarities

        sim = einsum('b i d, b j d -> b i j', q, k)

        # attention

        attn = sim.softmax(dim = -1)
        attn = self.dropout(attn)

        # aggregate out

        out = einsum('b i j, b j d -> b i d', attn, v)

        # merge heads and combine out

        out = rearrange(out, '(b h) (x y) d -> b (h d) x y', x = h, y = w, h = self.heads)
        return self.to_out(out)

#####
#####

# New HybridPerceptionBlockGenerator

class HPBGenerator(nn.Module):
    def __init__(self, input_nc, output_nc, ngf=64, norm_layer=nn.BatchNorm2d, use_dropout=False, n_blocks=9, padding_type='reflect'):
        assert(n_blocks >= 0)
        super(HPBGenerator, self).__init__()
        self.input_nc = input_nc
        self.output_nc = output_nc
        self.ngf = ngf
        if type(norm_layer) == functools.partial:
            use_bias = norm_layer.func == nn.InstanceNorm2d
        else:
            use_bias = norm_layer == nn.InstanceNorm2d

        model = [
            nn.ReflectionPad2d(3),
                nn.Conv2d(
                input_nc, ngf, 
                kernel_size=7, 
                padding=0,
                bias=use_bias
            ),
            norm_layer(ngf),
            nn.GELU()
        ]

        n_downsampling = 2
        for i in range(n_downsampling):
            mult = 2**i
            model += [
                nn.Conv2d(
                    ngf * mult, ngf * mult * 2, kernel_size=3,
                    stride=2, padding=1, bias=use_bias
                ),
                norm_layer(ngf * mult * 2),
                nn.GELU()
            ]

        mult = 2**n_downsampling
        for i in range(n_blocks):
            model += [
                HPB(ngf * mult, ngf)
            ]

        for i in range(n_downsampling):
            mult = 2**(n_downsampling - i)
            model += [
                nn.ConvTranspose2d(
                    ngf * mult, int(ngf * mult / 2),
                    kernel_size=3, stride=2,
                    padding=1, output_padding=1,
                    bias=use_bias
                ),
                norm_layer(int(ngf * mult / 2)),
                nn.GELU()
            ]
        model += [nn.ReflectionPad2d(3)]
        model += [nn.Conv2d(ngf, output_nc, kernel_size=7, padding=0)]
        model += [nn.Tanh()]

        self.model = nn.Sequential(*model)

    def forward(self, input):
        return self.model(input)

# Defines the generator that consists of Resnet blocks between a few
# downsampling/upsampling operations.
# Code and idea from Justin Johnson's architecture.
# https://github.com/jcjohnson/fast-neural-style/

class ResnetGenerator(nn.Module):
    def __init__(self, input_nc, output_nc, ngf=64, norm_layer=nn.BatchNorm2d, use_dropout=False, n_blocks=6, padding_type='reflect', use_attention=False):
        assert(n_blocks >= 0)
        super(ResnetGenerator, self).__init__()
        self.input_nc = input_nc
        self.output_nc = output_nc
        self.ngf = ngf
        if type(norm_layer) == functools.partial:
            use_bias = norm_layer.func == nn.InstanceNorm2d
        else:
            use_bias = norm_layer == nn.InstanceNorm2d

        model = [
            nn.ReflectionPad2d(3),
                nn.Conv2d(
                input_nc, ngf, 
                kernel_size=7, 
                padding=0,
                bias=use_bias
            ),
            norm_layer(ngf),
            nn.ReLU(True)
        ]

        n_downsampling = 2
        for i in range(n_downsampling):
            mult = 2**i
            model += [
                nn.Conv2d(
                    ngf * mult, ngf * mult * 2, kernel_size=3,
                    stride=2, padding=1, bias=use_bias
                ),
                norm_layer(ngf * mult * 2),
                nn.ReLU(True)
            ]

        mult = 2**n_downsampling
        for i in range(n_blocks):
            model += [
                ResnetBlock(
                    ngf * mult, 
                    padding_type=padding_type, 
                    norm_layer=norm_layer, 
                    use_dropout=use_dropout, 
                    use_bias=use_bias
                )
            ]

        for i in range(n_downsampling):
            mult = 2**(n_downsampling - i)
            model += [
                nn.ConvTranspose2d(
                    ngf * mult, int(ngf * mult / 2),
                    kernel_size=3, stride=2,
                    padding=1, output_padding=1,
                    bias=use_bias
                ),
                norm_layer(int(ngf * mult / 2)),
                nn.ReLU(True)
            ]

            if use_attention and i==0:
                model += [SelfAttention(128, 'relu')]

        model += [nn.ReflectionPad2d(3)]
        model += [nn.Conv2d(ngf, output_nc, kernel_size=7, padding=0)]
        model += [nn.Tanh()]

        self.model = nn.Sequential(*model)

    def forward(self, input):
        return self.model(input)


# Define a resnet block
class ResnetBlock(nn.Module):
    def __init__(self, dim, padding_type, norm_layer, use_dropout, use_bias):
        super(ResnetBlock, self).__init__()
        self.conv_block = self.build_conv_block(dim, padding_type, norm_layer, use_dropout, use_bias)

    def build_conv_block(self, dim, padding_type, norm_layer, use_dropout, use_bias):
        conv_block = []
        p = 0
        if padding_type == 'reflect':
            conv_block += [nn.ReflectionPad2d(1)]
        elif padding_type == 'replicate':
            conv_block += [nn.ReplicationPad2d(1)]
        elif padding_type == 'zero':
            p = 1
        else:
            raise NotImplementedError('padding [%s] is not implemented' % padding_type)

        conv_block += [
            nn.Conv2d(dim, dim, kernel_size=3, padding=p, bias=use_bias),
            norm_layer(dim),
            nn.ReLU(True)
        ]
        if use_dropout:
            conv_block += [nn.Dropout(0.5)]

        p = 0
        if padding_type == 'reflect':
            conv_block += [nn.ReflectionPad2d(1)]
        elif padding_type == 'replicate':
            conv_block += [nn.ReplicationPad2d(1)]
        elif padding_type == 'zero':
            p = 1
        else:
            raise NotImplementedError('padding [%s] is not implemented' % padding_type)
        conv_block += [
            nn.Conv2d(dim, dim, kernel_size=3, padding=p, bias=use_bias),
            norm_layer(dim)
        ]

        return nn.Sequential(*conv_block)

    def forward(self, x):
        out = x + self.conv_block(x)
        return out


# Defines the Unet generator.
# |num_downs|: number of downsamplings in UNet. For example,
# if |num_downs| == 7, image of size 128x128 will become of size 1x1
# at the bottleneck
class UnetGenerator(nn.Module):
    def __init__(
        self, 
        input_nc, 
        output_nc, 
        num_downs, ngf=64,
        norm_layer=nn.BatchNorm2d, 
        use_dropout=False
    ):
        super(UnetGenerator, self).__init__()

        # construct unet structure
        unet_block = UnetSkipConnectionBlock(
            ngf * 8, 
            ngf * 8, 
            input_nc=None, 
            submodule=None, 
            norm_layer=norm_layer, 
            innermost=True
        )
        for i in range(num_downs - 5):
            unet_block = UnetSkipConnectionBlock(
                ngf * 8, ngf * 8, 
                input_nc=None, 
                submodule=unet_block, 
                norm_layer=norm_layer, 
                use_dropout=use_dropout
            )
        unet_block = UnetSkipConnectionBlock(
            ngf * 4, ngf * 8, 
            input_nc=None, 
            submodule=unet_block, 
            norm_layer=norm_layer
        )
        unet_block = UnetSkipConnectionBlock(
            ngf * 2, ngf * 4, 
            input_nc=None, 
            submodule=unet_block, 
            norm_layer=norm_layer
        )
        unet_block = UnetSkipConnectionBlock(
            ngf, ngf * 2, 
            input_nc=None, 
            submodule=unet_block, 
            norm_layer=norm_layer
        )
        unet_block = UnetSkipConnectionBlock(
            output_nc, ngf, 
            input_nc=input_nc, 
            submodule=unet_block, 
            outermost=True, 
            norm_layer=norm_layer
        )

        self.model = unet_block

    def forward(self, input):
        return self.model(input)


# Defines the submodule with skip connection.
# X -------------------identity---------------------- X
#   |-- downsampling -- |submodule| -- upsampling --|
class UnetSkipConnectionBlock(nn.Module):
    def __init__(
        self, 
        outer_nc, 
        inner_nc, 
        input_nc=None,
        submodule=None, 
        outermost=False, 
        innermost=False, 
        norm_layer=nn.BatchNorm2d, 
        use_dropout=False
    ):
        super(UnetSkipConnectionBlock, self).__init__()
        self.outermost = outermost
        if type(norm_layer) == functools.partial:
            use_bias = norm_layer.func == nn.InstanceNorm2d
        else:
            use_bias = norm_layer == nn.InstanceNorm2d
        if input_nc is None:
            input_nc = outer_nc
        downconv = nn.Conv2d(
            input_nc, inner_nc, kernel_size=4,
            stride=2, padding=1, bias=use_bias
        )
        downrelu = nn.LeakyReLU(0.2, True)
        downnorm = norm_layer(inner_nc)
        uprelu = nn.ReLU(True)
        upnorm = norm_layer(outer_nc)

        if outermost:
            upconv = nn.ConvTranspose2d(
                inner_nc * 2, outer_nc,
                kernel_size=4, stride=2,
                padding=1
            )
            down = [downconv]
            up = [uprelu, upconv, nn.Tanh()]
            model = down + [submodule] + up
        elif innermost:
            upconv = nn.ConvTranspose2d(
                inner_nc, outer_nc,
                kernel_size=4, stride=2,
                padding=1, bias=use_bias
            )
            down = [downrelu, downconv]
            up = [uprelu, upconv, upnorm]
            model = down + up
        else:
            upconv = nn.ConvTranspose2d(
                inner_nc * 2, outer_nc,
                kernel_size=4, stride=2,
                padding=1, bias=use_bias
            )
            down = [downrelu, downconv, downnorm]
            up = [uprelu, upconv, upnorm]

            if use_dropout:
                model = down + [submodule] + up + [nn.Dropout(0.5)]
            else:
                model = down + [submodule] + up

        self.model = nn.Sequential(*model)

    def forward(self, x):
        if self.outermost:
            return self.model(x)
        else:
            return torch.cat([x, self.model(x)], 1)


# Defines the PatchGAN discriminator with the specified arguments.
class NLayerDiscriminator(nn.Module):
    def __init__(self, input_nc, ndf=64, n_layers=3, norm_layer=nn.BatchNorm2d, use_sigmoid=False, use_attention=False):
        super(NLayerDiscriminator, self).__init__()
        if type(norm_layer) == functools.partial:
            use_bias = norm_layer.func == nn.InstanceNorm2d
        else:
            use_bias = norm_layer == nn.InstanceNorm2d

        kw = 4
        padw = 1
        sequence = [
            nn.Conv2d(input_nc, ndf, kernel_size=kw, stride=2, padding=padw),
            nn.LeakyReLU(0.2, True)
        ]

        nf_mult = 1
        nf_mult_prev = 1
        for n in range(1, n_layers):
            nf_mult_prev = nf_mult
            nf_mult = min(2**n, 8)
            sequence += [
                nn.Conv2d(
                    ndf * nf_mult_prev, ndf * nf_mult,
                    kernel_size=kw, stride=2, padding=padw, bias=use_bias
                ),
                norm_layer(ndf * nf_mult),
                nn.LeakyReLU(0.2, True)
            ]

        nf_mult_prev = nf_mult
        nf_mult = min(2**n_layers, 8)
        sequence += [
            nn.Conv2d(
                ndf * nf_mult_prev, ndf * nf_mult,
                kernel_size=kw, stride=1, 
                padding=padw, bias=use_bias
            ),
            norm_layer(ndf * nf_mult),
            nn.LeakyReLU(0.2, True)
        ]
        if use_attention:
            sequence += [SelfAttention(512, 'relu')]
        sequence += [
            nn.Conv2d(ndf * nf_mult, 1, kernel_size=kw, stride=1, padding=padw)
        ]

        if use_sigmoid:
            sequence += [nn.Sigmoid()]

        self.model = nn.Sequential(*sequence)

    def forward(self, input):
        return self.model(input)

# class NLayerDiscriminatorSN(nn.Module):
#     def __init__(self, input_nc, ndf=64, n_layers=3, use_sigmoid=False, use_attention=False):
#         super(NLayerDiscriminatorSN, self).__init__()
#         use_bias = False

#         kw = 4
#         padw = 1
#         sequence = [
#             SpectralNorm(nn.Conv2d(input_nc, ndf, kernel_size=kw, stride=2, padding=padw)),
#             nn.LeakyReLU(0.2, True)
#         ]

#         nf_mult = 1
#         nf_mult_prev = 1
#         for n in range(1, n_layers):
#             nf_mult_prev = nf_mult
#             nf_mult = min(2**n, 8)
#             sequence += [
#                 SpectralNorm(
#                     nn.Conv2d(
#                         ndf * nf_mult_prev, 
#                         ndf * nf_mult,
#                         kernel_size=kw, stride=2, 
#                         padding=padw, bias=use_bias
#                     )
#                 ),
#                 nn.LeakyReLU(0.2, True)
#             ]

#         nf_mult_prev = nf_mult
#         nf_mult = min(2**n_layers, 8)
#         sequence += [
#             SpectralNorm(
#                 nn.Conv2d(
#                     ndf * nf_mult_prev, ndf * nf_mult,
#                     kernel_size=kw, stride=1, padding=padw, bias=use_bias
#                 )
#             ),
#             nn.LeakyReLU(0.2, True)
#         ]
#         if use_attention:
#             sequence += [SelfAttention(512, 'relu')]
#         sequence += [SpectralNorm(nn.Conv2d(ndf * nf_mult, 1, kernel_size=kw, stride=1, padding=padw))]

#         if use_sigmoid:
#             sequence += [nn.Sigmoid()]

#         self.model = nn.Sequential(*sequence)

#     def forward(self, input):
#         return self.model(input)

class PixelDiscriminator(nn.Module):
    def __init__(self, input_nc, ndf=64, norm_layer=nn.BatchNorm2d, use_sigmoid=False):
        super(PixelDiscriminator, self).__init__()
        if type(norm_layer) == functools.partial:
            use_bias = norm_layer.func == nn.InstanceNorm2d
        else:
            use_bias = norm_layer == nn.InstanceNorm2d

        self.net = [
            nn.Conv2d(input_nc, ndf, kernel_size=1, stride=1, padding=0),
            nn.LeakyReLU(0.2, True),
            nn.Conv2d(ndf, ndf * 2, kernel_size=1, stride=1, padding=0, bias=use_bias),
            norm_layer(ndf * 2),
            nn.LeakyReLU(0.2, True),
            nn.Conv2d(ndf * 2, 1, kernel_size=1, stride=1, padding=0, bias=use_bias)]

        if use_sigmoid:
            self.net.append(nn.Sigmoid())

        self.net = nn.Sequential(*self.net)

    def forward(self, input):
        return self.net(input)
