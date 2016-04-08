var mapSeries;
var dataSet, layoutTable, mapUnionChart, tableChart, tableChart1, tableChart2, populationChart, areaChart, houseSeatsChart, tableSolidCharts;

var createMapUnionChart = function(){
    var map = anychart.map();
    map.padding(0);
    map.margin(0);
    map.title().padding(0, 0, 15, 0).hAlign('center').useHtml(true).fontSize(14).fontColor('#212121');
    map.title('US States by the Year of Joining the Union');
    map.geoData(anychart.maps.united_states_of_america);

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
        return '<span style="font-size: 12px; color: #cfd8dc">Capital: </span>' + data['capital'] + '<br/>' +
            '<span style="font-size: 12px; color: #cfd8dc">Largest City: </span>' + data['largest_city'];
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
    mapSeries.hoverFill('#fff9c4');
    mapSeries.selectFill('#ffa000');
    mapSeries.selectStroke(anychart.color.darken('#ffa000'));
    mapSeries.colorScale(scale);
    mapSeries.stroke(function() {
        this.iterator.select(this.index);
        var pointValue = this.iterator.get(this.referenceValueNames[1]);
        var color = this.colorScale.valueToColor(pointValue);
        return anychart.color.darken(color);
    });

    var colorRange = map.colorRange();
    colorRange.enabled(true).orientation('bottom').align('center').length('90%');
    colorRange.ticks().stroke('3 #ffffff').position('center').length(5).enabled(true).zIndex(10000);
    colorRange.marker().size(5);
    colorRange.padding(0).colorLineSize(5);
    colorRange.labels().fontSize(11).padding([3,0,0,0]).textFormatter(function() {
        var range = this.colorRange;
        var name;
        if (isFinite(range.start + range.end)) {
            name = range.start + '-' + range.end;
        } else if (isFinite(range.start)) {
            name = 'After ' + range.start;
        } else {
            name = 'Before ' + range.end;
        }
        return name
    });

    map.listen('pointsSelect', function(e) {
        console.log('Select');
        var selected = [];
        var selectedPoints = e.seriesStatus[0].points;
        for (var i = 0; i < selectedPoints.length; i++) {
            selected.push(selectedPoints[i].id);
        }
        changeContent(selected);
    });
    return map;
};

var createTableChart = function(index, n){
    var table = anychart.ui.table();
    table.cellBorder(null);
    table
        .cellPadding(-4)
        .fontSize(11)
        .vAlign('middle');
    var contents = [
        [null, 'Name', 'Capital', 'Largest City', 'Since', 'Population', 'Water\nArea', 'Seats']];
    for (var i = index; i < n; i++) {
        var label = anychart.ui.label();
        label.width('100%').height('100%').text('').background().enabled(true).fill({
            src: states_data[i]['flag'],
            mode: acgraph.vector.ImageFillMode.FIT
        });
        contents.push([
            label,
            states_data[i]['name'],
            states_data[i]['capital'],
            states_data[i]['largest_city'],
            states_data[i]['value'],
            parseInt(states_data[i]['population']).toLocaleString(),
            Math.round(parseInt(states_data[i]['water_area']) * 100 / (parseInt(states_data[i]['water_area']) + parseInt(states_data[i]['land_area']))) + '%',
            states_data[i]['house_seats']
        ]);
    }
    table.contents(contents);
    table.getRow(0).fontSize(12).height(19).fontColor('#212121').cellBorder().bottom('2px #dedede');
    table.getRow(0).cellBorder().top('1px #dedede');
    table.getCol(0).maxWidth(30).cellPadding(0).hAlign('center');
    table.getCol(1).cellPadding([-4,-4,-4,10]);
    table.getCol(4).maxWidth(50).hAlign('center');
    table.getCol(5).maxWidth(80).hAlign('center');
    table.getCol(6).maxWidth(50).hAlign('center');
    table.getCol(7).maxWidth(50).hAlign('right');
    table.getCol(7).cellPadding([-4,5,-4,-4]);
    return table;
};

function solidChart(value) {
    var gauge = anychart.circularGauge();
    gauge.data([value, 100]);
    gauge.padding(20);
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
    gauge.bar(0).dataIndex(0).radius(80).width(50).fill('#64b5f6').stroke(null).zIndex(5);
    gauge.bar(1).dataIndex(1).radius(80).width(50).fill('#F5F4F4').stroke(stroke).zIndex(4);
    gauge.label().width('50%').height('20%').adjustFontSize(true).hAlign('center').anchor('center').maxFontSize(14);
    gauge.label()
        .hAlign('center')
        .anchor('center')
        .padding(5, 10)
        .zIndex(1)
        .text((value).toFixed(2) + '%');
    gauge.background().enabled(false);
    gauge.fill(null);
    gauge.stroke(null);
    return gauge
}

function getTableSolidCharts() {
    var table = anychart.ui.table(2, 3);
    table.cellBorder(null).cellPadding(-4);
    table.getRow(0).height(20);
    table.getRow(1).height(19);
    table.vAlign('middle').hAlign('center');
    table.getCell(0, 0).colSpan(3).fontSize(14).fontColor('#212121').border().bottom('1px #dedede');
    table.getRow(1).fontSize(12).fontColor('#212121').cellBorder().bottom('2px #dedede');
    populationChart = solidChart(0);
    areaChart = solidChart(0);
    houseSeatsChart = solidChart(0);
    table.contents([
        ['Percentage of USA Total'],
        ['Population', 'Land Area', 'House Seats'],
        [populationChart, areaChart, houseSeatsChart]
    ]);
    table.getRow(2).maxHeight(200);
    return table;
}

function changeContent(ids) {
    var population = 0;
    var area = 0;
    var seats = 0;
    for (var i = 0; i < states_data.length; i++) {
        if (ids.indexOf(states_data[i]['id']) >= 0) {
            if (i < states_data.length/2){
                tableChart1.getRow(i + 1).cellFill('#fff9c4');
            }else{
                tableChart2.getRow(i - states_data.length/2 + 1).cellFill('#fff9c4');
            }
            tableChart.getRow(i + 1).cellFill('#fff9c4');
        }else{
            if (i < states_data.length/2){
                tableChart1.getRow(i + 1).cellFill('#fff');
            }else{
                tableChart2.getRow(i - states_data.length/2 + 1).cellFill('#fff');
            }
            tableChart.getRow(i + 1).cellFill('#fff');
        }
    }
    for (i = 0; i < ids.length; i++) {
        var data = getData(ids[i]);
        population += parseInt(data['population']);
        area += parseInt(data['area']);
        seats += parseInt(data['house_seats']);

    }
    populationChart.data([(population * 100 / getDataSum('population')).toFixed(2), 100]);
    populationChart.label().text((population * 100 / getDataSum('population')).toFixed(2) + '%');
    populationChart.tooltip().textFormatter(function(){
        return (population * 100 / getDataSum('population')).toFixed(2) + '%';
    });
    areaChart.data([(area * 100 / getDataSum('area')).toFixed(2), 100]);
    areaChart.label().text((area * 100 / getDataSum('area')).toFixed(2) + '%');
    areaChart.tooltip().textFormatter(function(){
        return (area * 100 / getDataSum('area')).toFixed(2) + '%';
    });
    houseSeatsChart.data([(seats * 100 / getDataSum('house_seats')).toFixed(2), 100]);
    houseSeatsChart.label().text((seats * 100 / getDataSum('house_seats')).toFixed(2) + '%');
    houseSeatsChart.tooltip().textFormatter(function(){
        return (seats * 100 / getDataSum('house_seats')).toFixed(2) + '%';
    });
}

// Creates general layout table with two inside layout tables
function fillInMainTable(flag){
    if (flag == 'wide') {
        layoutTable.contents([
            [mapUnionChart, null, tableSolidCharts],
            [null, null, null],
            [tableChart1, null, tableChart2]
        ], true);
        layoutTable.getRow(0).height('35%');
        layoutTable.getRow(0).maxHeight(320);

        layoutTable.getCol(1).width(30);
        layoutTable.getRow(1).height(15);
        layoutTable.getRow(2).height(null);
    } else {
        layoutTable.contents([
            [mapUnionChart],
            [null],
            [tableSolidCharts],
            [tableChart]
        ], true);
        layoutTable.getRow(0).height(300);
        layoutTable.getRow(0).maxHeight(null);
        layoutTable.getRow(1).height(20);
        layoutTable.getRow(2).height(200);
        layoutTable.getRow(3).height(700);
    }
    layoutTable.draw();
}

anychart.onDocumentReady(function() {
    // Pre-processing of the data
    for (var i = 0; i < states_data.length; i++) {
        states_data[i]['value'] = new Date(states_data[i].statehood).getUTCFullYear();
        states_data[i]['short'] = states_data[i]['id'];
        states_data[i]['id'] = states_data[i]['id'];
    }
    dataSet = anychart.data.set(states_data);

    // Creating dashboard's parts
    mapUnionChart = createMapUnionChart();
    tableChart = createTableChart(0, states_data.length);
    tableChart1 = createTableChart(0, states_data.length/2);
    tableChart2 = createTableChart(states_data.length/2, states_data.length);
    tableSolidCharts = getTableSolidCharts();

    // Creating table for dashboard layout
    layoutTable = anychart.ui.table();
    layoutTable.cellBorder(null);
    layoutTable.container('container-dashboard');

    if ($(window).width() > 767) {
        fillInMainTable('wide');
    } else if ($(window).width() <= 767) {
        fillInMainTable('slim');
    }
    layoutTable.draw();
    mapSeries.select(12);
    mapSeries.select(13);
    mapSeries.select(14);
    mapSeries.select(16);
    changeContent(['IN', 'KY', 'IL', 'IA']);
});

$(window).resize(function() {
    if (layoutTable.colsCount() == 1 && $(window).width() > 767) {
        fillInMainTable('wide');
    } else if (layoutTable.colsCount() == 3 && $(window).width() <= 767) {
        fillInMainTable('slim');
    }
});