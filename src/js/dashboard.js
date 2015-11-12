var mapSeries;
var dataSet, tableChart, populationChart, areaChart, houseSeatsChart;

anychart.onDocumentReady(function() {

// pre-processing of the data
    for (var i = 0; i < data.length; i++) {
        data[i]['value'] = new Date(data[i].statehood).getUTCFullYear();
        data[i]['short'] = data[i]['id'];
        data[i]['id'] = data[i]['id'];
    }
    dataSet = anychart.data.set(data);

// Setting layout table
    layoutTable = anychart.ui.table(3, 5);
    layoutTable.cellBorder(null);
    layoutTable.getCol(0).width('2.5%');
    layoutTable.getCol(1).width('50%');
    layoutTable.getCol(2).width('.5%');
    layoutTable.getCol(4).width('2.5%');
    layoutTable.getRow(0).height('45%');
    tableChart = getTableChart();
    layoutTable.getCell(0, 3).content(getTableCharts());
    layoutTable.getCell(1, 3).rowSpan(2).content(tableChart);
    layoutTable.getCell(0, 1).rowSpan(3).content(drawMap());
    layoutTable.container('container-dashboard');
    layoutTable.draw();

    mapSeries.select(12);
    mapSeries.select(13);
    mapSeries.select(14);
    mapSeries.select(16);
    changeContent(['IN', 'KY', 'IL', 'IA']);


    function getTableChart() {
        var table = anychart.ui.table();
        table.cellBorder(null);
        table.fontFamily("'Verdana', Helvetica, Arial, sans-serif")
            .fontSize(11)
            .hAlign('center')
            .textOverflow('.')
            .textWrap('noWrap')
            .fontColor('#545f69')
            .vAlign('middle');
        table.getCell(0, 0).colSpan(8).fontSize(13);
        table.useHtml(true).contents([
            ['Selected States Data'],
            [null, 'Name', 'Capital', 'Largest<br/>City', 'State<br/>Since', 'Population', 'Area', 'House<br/>Seats'],
            [null]
        ]);
        table.getRow(0).cellBorder().bottom('1px #dedede');
        table.getRow(1).cellBorder().bottom('2px #dedede');
        table.getRow(0).vAlign('bottom');
        table.getRow(0).height(45);
        table.getRow(1).height(35);
        table.getCol(0).width(25);
        table.getCol(1).hAlign('left');
        table.getCol(2).hAlign('left');
        table.getCol(3).hAlign('left');
        table.getCol(4).width(50);
        table.getCol(5).width(80);
        table.getCol(7).width(50);
        return table;
    }

    function solidChart(value) {
        var gauge = anychart.circularGauge();
        gauge.data([value, 100]);
        gauge.padding(15);
        gauge.margin(0);
        var axis = gauge.axis().radius(100).width(1).fill(null);
        axis.scale()
            .minimum(0)
            .maximum(100)
            .ticks({interval: 1})
            .minorTicks({interval: 1});
        axis.labels().enabled(false);
        axis.ticks().enabled(false);
        axis.minorTicks().enabled(false);

        var stroke = '1 #e5e4e4';
        gauge.bar(0).dataIndex(0).radius(80).width(60).fill('#64b5f6').stroke(null).zIndex(5);
        gauge.bar(1).dataIndex(1).radius(80).width(60).fill('#F5F4F4').stroke(stroke).zIndex(4);
        gauge.label().width('40%').height('20%').adjustFontSize(true).hAlign('center').anchor('center');
        gauge.label()
            .hAlign('center')
            .anchor('center')
            .padding(5, 10)
            .zIndex(1);
        gauge.background().enabled(false);
        gauge.fill(null);
        gauge.stroke(null);
        return gauge
    }

    function getTableCharts() {
        var table = anychart.ui.table(2, 3);
        table.cellBorder(null);
        table.getRow(0).height(45);
        table.getRow(1).height(25);
        table.fontFamily("'Verdana', Helvetica, Arial, sans-serif")
            .fontSize(11)
            .useHtml(true)
            .fontColor('#545f69')
            .hAlign('center')
            .vAlign('middle');
        table.getCell(0, 0).colSpan(3).fontSize(13).vAlign('bottom').border().bottom('1px #dedede');
        table.getRow(1).cellBorder().bottom('2px #dedede');
        populationChart = solidChart(0);
        areaChart = solidChart(0);
        houseSeatsChart = solidChart(0);
        table.contents([
            ['Percentage of Total'],
            ['Population', 'Land Area', 'House Seats'],
            [populationChart, areaChart, houseSeatsChart]
        ]);
        return table;
    }

    function changeContent(ids) {
        var contents = [
            ['List of Selected States'],
            [null, 'Name', 'Capital', 'Largest<br/>City', 'State<br/>Since', 'Population', 'Water<br/>Area', 'House<br/>Seats']];
        var population = 0;
        var area = 0;
        var seats = 0;
        for (var i = 0; i < ids.length; i++) {
            var data = getData(ids[i]);
            population += parseInt(data['population']);
            area += parseInt(data['area']);
            seats += parseInt(data['house_seats']);

            var label = anychart.ui.label();
            label.width('100%').height('100%').text(null).background().enabled(true).fill({
                src: data['flag'],
                mode: acgraph.vector.ImageFillMode.FIT
            });
            contents.push([
                label, data['name'], data['capital'], data['largest_city'], data['value'], formatMoney(parseInt(data['population']), 0, '.', ','), Math.round(parseInt(data['water_area']) * 100 / (parseInt(data['water_area']) + parseInt(data['land_area']))) + '%', data['house_seats']
            ]);
        }

        populationChart.data([(population * 100 / getDataSum('population')).toFixed(2), 100]);
        populationChart.label().text((population * 100 / getDataSum('population')).toFixed(2) + '%');

        areaChart.data([(area * 100 / getDataSum('area')).toFixed(2), 100]);
        areaChart.label().text((area * 100 / getDataSum('area')).toFixed(2) + '%');

        houseSeatsChart.data([(seats * 100 / getDataSum('house_seats')).toFixed(2), 100]);
        houseSeatsChart.label().text((seats * 100 / getDataSum('house_seats')).toFixed(2) + '%');

        tableChart.contents(contents);
        for (i = 0; i < ids.length; i++) {
            tableChart.getRow(i + 2).maxHeight(35);
        }
    }

    function drawMap() {
        var map = anychart.map();

        //set map title settings using html
        map.title().padding(0, 0, 10, 0).hAlign('center').useHtml(true).fontFamily("'Verdana', Helvetica, Arial, sans-serif");
        map.title('<span style="color:#7c868e; font-size: 14px">US States<br/>by the Year of Joining the Union</span>' +
        '<br/><span style="color:#545f69; font-size: 10px">Pick your state to see when joined or pick a time period to see who else joined around that time.</span>');

        var credits = map.credits();
        credits.enabled(true);
        credits.url('//en.wikipedia.org/wiki/List_of_states_and_territories_of_the_United_States');
        credits.text('Data source: https://en.wikipedia.org/wiki/List_of_states_and_territories_of_the_United_States');
        credits.logoSrc('//en.wikipedia.org/static/favicon/wikipedia.ico');

        //set map Geo data
        map.geoData(anychart.maps.united_states_of_america);

        map.listen('pointsSelect', function(e) {
            var selected = [];
            var selectedPoints = e.seriesStatus[0].points;
            for (var i = 0; i < selectedPoints.length; i++) {
                selected.push(selectedPoints[i].id);
            }
            changeContent(selected);
        });

        mapSeries = map.choropleth(dataSet);
        mapSeries.geoIdField('postal');
        mapSeries.labels(null);
        mapSeries.tooltip().textWrap('byLetter').useHtml(true);
        mapSeries.tooltip().title().useHtml(true);
        mapSeries.tooltip().titleFormatter(function() {
            var data = getData(this.id);
            return this.name + '<span style="font-size: 10px"> (since ' + data['statehood'] + ')</span>';
        });
        mapSeries.tooltip().textFormatter(function() {
            var data = getData(this.id);
            return '<span style="font-size: 12px; color: #b7b7b7">Capital: </span>' + data['capital'] + '<br/>' +
                '<span style="font-size: 12px; color: #b7b7b7">Largest City: </span>' + data['largest_city'];
        });
        var scale = anychart.scales.ordinalColor([
            {less: 1790},
            {from: 1790, to: 1800},
            {from: 1800, to: 1820},
            {from: 1820, to: 1850},
            {from: 1850, to: 1875},
            {from: 1875, to: 1900},
            {greater: 1900}
        ]);
        scale.colors(['#81d4fa', '#4fc3f7', '#29b6f6', '#039be5', '#0288d1', '#0277bd', '#01579b']);
        mapSeries.hoverFill('#f06292');
        mapSeries.selectFill('#c2185b');
        mapSeries.selectStroke(anychart.color.darken('#c2185b'));
        mapSeries.colorScale(scale);

        mapSeries.stroke(function() {
            this.iterator.select(this.index);
            var pointValue = this.iterator.get(this.referenceValueNames[1]);
            var color = this.colorScale.valueToColor(pointValue);
            return anychart.color.darken(color);
        });

        var colorRange = map.colorRange();
        colorRange.enabled(true);
        colorRange.ticks().stroke('3 #ffffff').position('center').length(20).enabled(true);
        colorRange.colorLineSize(5);
        colorRange.labels().fontSize(11).padding(5, 0, 0, 0).textFormatter(function() {
            var range = this.colorRange;
            var name;
            if (isFinite(range.start + range.end)) {
                name = range.start + ' - ' + range.end;
            } else if (isFinite(range.start)) {
                name = 'After ' + range.start;
            } else {
                name = 'Before ' + range.end;
            }
            return name
        });
        return map;
    }

    function formatMoney(n, c, d, t) {
        c = isNaN(c = Math.abs(c)) ? 2 : c;
        d = d == undefined ? "." : d;
        t = t == undefined ? "," : t;
        var s = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    }
});

function getData(id) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].id == id) return data[i]
    }
}
function getDataSum(field) {
    var result = 0;
    for (var i = 0; i < data.length; i++) {
        result += parseInt(data[i][field])
    }
    return result
}