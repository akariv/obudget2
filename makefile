VISUALIZATIONS = visualization-base \
				 hc-area-chart/area-chart \
				 hc-pie-chart/pie-chart \
				 
SRC = $(VISUALIZATIONS:%=visualizations/%) obudget
OUT = src/jslib/ob.js

all: $(OUT) 

out/ob.coffee: $(SRC:%=src/%.coffee)
	mkdir -p $(dir $@)
	echo cat $^ > $@
	cat $^ > $@
	
$(OUT): out/ob.coffee
	coffee -c -o $(dir $(OUT)) $<
