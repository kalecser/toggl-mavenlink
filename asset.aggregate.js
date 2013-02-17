var asset = asset || {};

asset.AVG = function () { return { sum: new commons.Ammount(0), count: 0, avg: function() { return this.sum.divide(this.count).value(); } }; };

asset.aggregateData = function (data, aggregators, filters) {


    if (aggregators.length != filters.length) throw "Internal error aggregating data";

    aggregators = _(aggregators).map(function (e) {
        if (e == null || e == 'undefined') return "groupby";
        return e;
    });

    filters = _(filters).map(function (e) {
        if (e == null || e == 'undefined') return "true";
        return e;
    });

    var groupColumns =
		_(aggregators)
		.map(function (e, i) {
		    if (e == 'groupby')
		    { return i; }
		    else
		    { return null; }
		}).filter(function (e) {
		    return e != null;
		});

    asset.operators = {
        count: function (i) {
            var value = "e[" + i + "]";
            value = "asset.aggregateData.SplitIfMultipleValues(" + value + ")";
            value = "Enumerable.From(" + value + ").Select('e=>e')";
            value = value + ".Aggregate(0,'acc, e => acc += 1')";
            value = ".Aggregate(0,\\\"acc, e => acc += " + value + "\\\"))";
            return value;
        },
        
        sum: function(i) {
            var value = "e[" + i + "]";
            value = "asset.aggregateData.SplitIfMultipleValues(" + value + ")";
            value = "Enumerable.From(" + value + ").Select('e=>new commons.Ammount(e)')";
            value = value + ".Aggregate(new commons.Ammount(0),'acc, e => acc.add(e)')";
            value = ".Aggregate(new commons.Ammount(0),\\\"acc, e => acc.add(" + value + ")\\\").value())";
            return value;
        },
        
        min: function (i) {
            var value = "e[" + i + "]";
            value = "asset.aggregateData.SplitIfMultipleValues(" + value + ")";
            value = "Enumerable.From(" + value + ").Select('e=>new commons.Ammount(e)')";
            value = value + ".Aggregate(Number.MAX_VALUE,'acc, e => acc = Math.min(acc, e.value())')";
            value = ".Aggregate(Number.MAX_VALUE,\\\"acc, e => acc = Math.min(acc," + value + ")\\\"))";
            return value;
        },
        
        max: function (i) {
            var value = "e[" + i + "]";
            value = "asset.aggregateData.SplitIfMultipleValues(" + value + ")";
            value = "Enumerable.From(" + value + ").Select('e=>new commons.Ammount(e)')";
            value = value + ".Aggregate(Number.MIN_VALUE,'acc, e => acc = Math.max(acc, e.value())')";
            value = ".Aggregate(Number.MIN_VALUE,\\\"acc, e => acc = Math.max(acc," + value + ")\\\"))";
            return value;
        },
        
        avg: function (i) {
            var value = "e[" + i + "]";
            value = "asset.aggregateData.SplitIfMultipleValues(" + value + ")";
            value = "Enumerable.From(" + value + ").Select('e=>new commons.Ammount(e)')";
            value = value + ".Aggregate(asset.AVG(),function(agg, e){agg.count ++; agg.sum = agg.sum.add(e); return agg;})";
            value = ".Aggregate(asset.AVG(),function(agg, e){AGG = agg;agg.count+=" + value + ".count; agg.sum = agg.sum.add(" + value + ".sum);  return agg;}).avg())";
            return value;
        },

        concat: function (i) { return ".Select('e => e[" + i + "]').ToArray().join(','))"; },
        
        groupby: function (i) { return ".source[0]||[''])[" + i + "]"; },
        first: function (i) { return ".source[0]||[''])[" + i + "]"; },
    };

    var aggregated = aggregators.map(function (e, i) { return eval('asset.operators.' + e + '(' + i + ')'); });
    var withFilters = _(aggregated).map(function(e, i) {
        var filteredData = "g.Where(\\\"e=>" + filters[i] + "\\\").ToArray()";
        return "(Enumerable.From(" + filteredData + ")" + e;
    });
    withFilters = withFilters.join(',');
    
    var parameters = {
        groups: groupColumns.map(function(e) { return 'e[' + e + ']'; }).join(' + '),
        aggregations: withFilters
    };


    var template = _(
		   'Enumerable.From(data).' +
		   'GroupBy("e=><%= groups %>").' +
		   'Select("g => [<%= aggregations %>]").ToArray()')
	    .template();
    CODE = template(parameters);
    return eval(template(parameters));
};

asset.aggregateData.SplitIfMultipleValues = function (value) {
    if (typeof value == 'string') return value.split('||');
    return [value];
}
