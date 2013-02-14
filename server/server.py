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
    return redirect('/r/test')

@app.route('/api/version')
def version():
    resp = make_response(Response(response=r.get("version"), content_type="application/json", ))
    resp.cache_control.no_cache = True
    return resp

@app.route("/upload", methods=['POST'])
def upload():
    print "UPLOAD! %r" % request.data  
    print "%r" % (request.data)
    data = json.loads(request.data)
    print "%r" % (data)
    data = json.dumps(data,ensure_ascii=True)
    print "%r" % (data)
    slug = r.scard("R:all")+1000
    url = '/r/%d' % slug
    print url
    r.set("R:%d" % slug, data)
    response = { 'url' : url }
    response = json.dumps(response)
    return Response(response=response, content_type="application/json")

@app.route("/r/<slug>", methods=['GET'])
def main_page(slug):
    report = r.get('R:%s' % slug)
    print "%r" % (report)
    return render_template('main.html',
                           report=report,
                           less=file('../client/main.less').read(), 
                           coffee=file('../client/main.coffee').read())

@app.route("/api/<slug>", methods=['GET'])
def getitem(slug):

    if slug.startswith('I'):
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
        response["ids`"] = [ json.loads(r.get(i)) for i in response["ids"] ]       
        response["id"] = slug
        return Response(response=json.dumps(response), content_type="application/json")

    if slug == "roots":
        response = json.loads(r.get("roots"))
        response = { "roots" : response }
        return Response(response=json.dumps(response), content_type="application/json")      

    if slug == "all":
        all_reps = r.smembers("R:all")
        response = []
        for slug in all_reps:
            rep = json.loads(r.get(slug))
            rep["id"] = slug
            response.append(rep)
            
        return Response(response=json.dumps(response), content_type="application/json")
   
if __name__=="__main__":
    r = Redis()
    r.set('version',int(os.stat('../data/out.json').st_mtime))
    def update_db(r):
        everything = json.load(file('../data/out.json'))
        for k,v in everything.iteritems():
            r.set(k,json.dumps(v))
            gevent.sleep(0)
        for k in r.keys("R:*"):
            r.sadd("R:all",k)
        print "DONE UPDATING DB"
    try:
        from gevent import monkey ; monkey.patch_all()
        from gevent.wsgi import WSGIServer

        gevent.spawn(update_db,r)

        http_server = WSGIServer(('', 5000), app)
        print "note: running with greenlet"
        http_server.serve_forever()

    except:
        raise
        print "note: running without greenlet"
        update_db(everything,r)
        app.run(host="0.0.0.0",debug=True)
