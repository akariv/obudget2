#!/usr/bin/env python
# encoding: utf8

from flask import Flask, g, request, Response, redirect, render_template, session, make_response
from flask.helpers import url_for
import urllib
import json
import os
import datetime
from redis import Redis
import gevent
import md5
from svg2png import svg2png

try:
    from gevent import Greenlet, sleep
    def _timer(t,f):
        print "Saving data"
        sleep(t)
        f()
    Timer = lambda t,f: Greenlet( _timer, t,f )
except Exception,e:
    print e,"running with native timers"
    from threading import Timer
    
app = Flask(__name__)
app.debug = True

@app.route('/')
def idx():
    return redirect('/r/home')

@app.route('/api/version')
def version():
    resp = make_response(Response(response=r.get("version"), content_type="application/json", ))
    resp.cache_control.no_cache = True
    return resp

@app.route("/upload", methods=['POST'])
def upload():
    print "UPLOAD! %r" % request.data  
    data = json.loads(request.data)
    keys_to_del = []
    allowed_keys = ["description","ids","author","author_link","title","normalize_id", "use_real_values", "compare_id", "extra_details"]

    svg = data.get('svg').encode("utf8")
    if svg:
        del data['svg']

    for k,v in data.iteritems():
        if k not in allowed_keys:
            keys_to_del.append(k)
    for k in keys_to_del:
        del data[k]

    print "UPLOAD: filtered obj %r" % data
    slug = "|".join( [ json.dumps(data.get(k),ensure_ascii=True) for k in allowed_keys ] )
    data = json.dumps(data,ensure_ascii=True)
    print "UPLOAD: data for key: %r" % slug
    slug = md5.md5(slug).hexdigest()[:8]
    url = '/r/%s' % slug
    print url

    if svg:
        svg2png( svg, slug )

    r.set("R:%s" % slug, data)
    r.zincrby("R:all", "R:%s" % slug)
    response = { 'url' : url }
    response = json.dumps(response)
    return Response(response=response, content_type="application/json")

@app.route("/img/<slug>", methods=['GET'])
def get_image(slug):
    assert("." not in slug)
    assert("/" not in slug)
    return Response(response=file("imgstore/%s.png" % slug).read(), content_type="image/png" )

@app.route("/r/<slug>", methods=['GET'])
def main_page(slug):
    report = r.get('R:%s' % slug)
    if not report: report = "null"
    print "%r" % (report)
    return render_template('main.html',
                           report=report,
                           r=json.loads(report),
                           slug=slug,
                           less=file('../client/main.less').read(), 
                           coffee=file('../client/main.coffee').read().decode('utf8'))# + file('../client/visualizations.coffee').read())

@app.route("/api/<slug>", methods=['GET'])
def getitem(slug):

    slug = urllib.unquote(slug)

    if slug.startswith('I') or slug.startswith('C'):
        return Response(response=r.get(slug), content_type="application/json")

    if slug.startswith('S'):
        origin,term = slug.split('__')
        terms = [ term[i:i+5] for i in range(max(len(term)-5,0)+1) ]
        searchlist=None
        for shortterm in terms:
            slug = "%s__%s" % (origin,shortterm)
            _searchlist = r.get(slug)
            if _searchlist!=None:
                _searchlist = json.loads(r.get(slug))
            else:
                _searchlist=[]
            if searchlist==None:
                searchlist = set(_searchlist)
            else:
                searchlist = searchlist.intersection(set(_searchlist))
            if len(searchlist)==0:
                break
        searchlist = [ json.loads(r.get(x)) for x in searchlist ]
        return Response(response=json.dumps(searchlist), content_type="application/json")

    if slug.startswith('R'):
        response = json.loads(r.get(slug))
        response["ids"] = [ json.loads(r.get(i)) for i in response["ids"] ]       
        response["id"] = slug
        r.zincrby("R:all", slug)
        return Response(response=json.dumps(response), content_type="application/json")

    if slug == "roots":
        response = json.loads(r.get("roots"))
        response = { "roots" : response }
        return Response(response=json.dumps(response), content_type="application/json")      

    if slug == "all":
        all_reps = r.zrange("R:all",0,-1,desc=True)
        response = []
        for slug in all_reps:
            try:
                rep = r.get(slug)
            except:
                continue
            if not rep: continue
            print slug
            rep = json.loads(rep)
            rep["id"] = slug
            response.append(rep)

        return Response(response=json.dumps(response), content_type="application/json")

    if slug == "series":
        all_sers = r.smembers("C:all")
        response = []
        for slug in all_sers:
            ser = json.loads(r.get(slug))
            print "%r" % ser
            response.append(ser)
            
        return Response(response=json.dumps(response), content_type="application/json")
   
if __name__=="__main__":
    r = Redis()
    r.set('version',int(os.stat('../data/out.json').st_mtime))
    def update_db(r):
        for line in file('../data/out.json'):
            k,v = json.loads(line)
            r.set(k,json.dumps(v))
            gevent.sleep(0)
        r.delete("R:all")
        for k in r.keys("R:*"):
            if k!="R:all":
                r.zincrby("R:all",k,0)
        r.delete("C:all")
        for k in r.keys("C*"):
            if k != "C:all" and k != "Cinflation":
                r.sadd("C:all",k)
        print "DONE UPDATING DB"
    try:
        from gevent import monkey ; monkey.patch_all()
        from gevent.wsgi import WSGIServer

        gevent.spawn(update_db,r)

        http_server = WSGIServer(('', 8000), app)
        print "note: running with greenlet"
        http_server.serve_forever()

    except:
        raise
        print "note: running without greenlet"
        update_db(everything,r)
        app.run(host="0.0.0.0",port=8000,debug=True)
