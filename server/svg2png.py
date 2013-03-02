import cairo
import rsvg
import re

width_re = re.compile('width="([0-9]+)')
height_re = re.compile('height="([0-9]+)')

def svg2png(svg,slug):

    width = int(width_re.findall(svg)[0])
    height = int(height_re.findall(svg)[0])

    print "writing png for %s, %dx%d" % (slug, width, height)

    img =  cairo.ImageSurface(cairo.FORMAT_RGB24, width, height)
    
    ctx = cairo.Context(img)
    
    handler= rsvg.Handle(None, str(svg))
    
    handler.render_cairo(ctx)
    
    img.write_to_png("imgstore/%s.png"%slug)

if __name__=="__main__":
    svg2png("<svg></svg>","test")
