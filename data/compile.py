#!/usr/bin/env python
#encoding: utf8

import json
import pprint
import csv

title_fixes = [
  (u"ביטחון", u"בטחון" ),
  (u"הבנוי", u"הבינוי" ),
  (u"`", u"א" ),
  (u"גמלאות", u"גימלאות" ),
  (u"התעשיה", u"התעשייה" ),
]

explanations = list(csv.reader(file("explanations.csv")))
explanations = [ [("EX0" if len(x[0].strip()) % 2 == 1 else "EX") +  x[0].strip(), [x[1].strip().decode('utf8'),x[2].strip().decode('utf8')]] for x in explanations ]
explanations = dict(explanations)

def unify(f):
    unified = {}
    allcodes = {}
    for line in f:
        if line.strip()=='': continue
        line = json.loads(line)
        title = " ".join(line["title"].strip().split())
        for s,d in title_fixes:
            title = title.replace(s,d)
        code = line["code"]
        if code == "00":
            title = u'הוצאות המדינה'
        if code.startswith("0000"):
            code = "RE"+code[4:]
        elif code.startswith("00"):
            code = "EX"+code[2:]
        key = [code,title]
        key = json.dumps(key)
        year = int(line["year"])
        if line.get("net_used",0) > 0:
            line["value"] = line["net_used"]
            line["planned"] = False
        elif line.get("net_allocated",0) > 0:
            line["value"] = line["net_allocated"]
            line["planned"] = True
        else:
            continue
        for k in ["title","code","year","net_allocated","net_used","net_revised","gross_allocated","gross_used","gross_revised"]:
            if k in line.keys():
                del line[k]
        unified.setdefault(key,{}).setdefault("y",{})[year] = line
        unified[key].setdefault("id","I%d" % len(unified))   
        if year == 2011:
            explanation = explanations.get(code)
            if explanation:
                expl_t, expl = explanation
                if expl_t != title: print "MISMATCH:\n\t%s\n\t%s" % ( expl_t.encode('utf8'), title.encode('utf8'))
                unified[key]["expl"] = expl
                
        ident = unified[key]["id"]
        allcodes.setdefault(code,set([])).add(ident)

    rev = {}
    for k,v in unified.iteritems():
        k=json.loads(k)           
        v.update(dict(zip(["c","t"],k)))
        ident = v["id"]
        rev[ident] = v

    roots = []
    for k,v in rev.iteritems():
        years = set(v.get("y",{}).keys())
        parents = []
        parent_code = v["c"]
        while len(parents) == 0 and len(parent_code)>0:
            parent_code = parent_code[:-2]
            potential_parents = allcodes.get(parent_code,[])
            parents.extend([p for p in potential_parents if len(years.intersection(set(rev[p].get("y",{}).keys())))>0 ])
        v["p"] = parents
        for p in parents:
            rev[p]["d"]=True
        if len(parents)==0:
            roots.append(k)
    
    print "%d unified items" % len(rev)
    print "roots: %r" % roots
    return rev, roots

def all_substrings(s):
    for i in range(len(s)):
        for j in range(i,i+6):#len(s)+1):
            yield s[i:j]

def make_searches(items):
    searches = {}
    for ident,item in items.iteritems():
        title = item["t"]
        code = item["c"]
        for s in all_substrings(title):
            kids = [ident]
            while len(kids) > 0:
                kid = kids.pop()
                parents = items[kid]["p"]
                for parent in parents:
                    key="S%s__%s" % (parent,s)
                    searches.setdefault(key,set()).add(kid)
                kids.extend(parents)
    print "%d search items" % len(searches)
    for k,v in searches.iteritems():
        searches[k] = list(v)
    return searches

def compile(filename):
    unified, roots = unify(file(filename))
    searches = make_searches(unified)
    unified.update(searches)
    unified["roots"] = roots

    report = None
    for k,v in unified.iteritems():
        if k.startswith("I") and v["c"] == "EX793002":
            report = { "title": "Test report",
                       "description" : "This is a test report!",
                       "author" : "_the_ author",
                       "ids" : [ k ] }
    if report != None:
        unified["R:test"] = report
    
    of = file("out.json","w")
    for k,v in unified.iteritems():
        of.write("%s\n"%json.dumps([k,v]))

if __name__=="__main__":
    compile("master.json")
