var origin = [480, 300], j = 10, scale = 20, scatter = [], yLine = [], xGrid = [], beta = 0, alpha = 0, key = function (d) { return d.id; }, startAngle = Math.PI / 4;
var svg = d3.select('svg').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
var color = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY;

var grid3d = d3._3d()
    .shape('GRID', 20)
    .origin(origin)
    .rotateY(startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var point3d = d3._3d()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .z(function (d) { return d.z; })
    .origin(origin)
    .rotateY(startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY(startAngle)
    .rotateX(-startAngle)
    .scale(scale);

function processData(data, tt) {

    var points = svg.selectAll('circle').data(data[1], key);

    points
        .enter()
        .append('circle')
        .attr('class', '_3d')
        .attr('opacity', 0)
        .attr('cx', posPointX)
        .attr('cy', posPointY)
        .merge(points)
        .transition().duration(tt)
        .attr('r', 3)
        .attr('stroke', function (d) { return d3.color(color(d.id)).darker(3); })
        .attr('fill', function (d) { return color(d.id); })
        .attr('opacity', 1)
        .attr('cx', posPointX)
        .attr('cy', posPointY);

    points.exit().remove();

    d3.selectAll('._3d').sort(d3._3d().sort);
}

function posPointX(d) {
    return d.projected.x;
}

function posPointY(d) {
    return d.projected.y;
}

function init() {
    var cnt = 0;
    xGrid = [], scatter = [], yLine = [];
    for (var z = -j; z < j; z++) {
        for (var x = -j; x < j; x++) {
            xGrid.push([x, 1, z]);
            scatter.push({ x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++ });
        }
    }

    d3.range(-1, 11, 1).forEach(function (d) { yLine.push([-j, -d, -j]); });

    var data = [
        grid3d(xGrid),
        point3d(scatter),
        yScale3d([yLine])
    ];
    processData(data, 1000);
}

function dragStart() {
    mx = d3.event.x;
    my = d3.event.y;
}

function dragged() {
    mouseX = mouseX || 0;
    mouseY = mouseY || 0;
    beta = (d3.event.x - mx + mouseX) * Math.PI / 230;
    alpha = (d3.event.y - my + mouseY) * Math.PI / 230 * (-1);
    var data = [
        grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
        point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(scatter),
        yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
    ];
    processData(data, 0);
}

function dragEnd() {
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}

d3.selectAll('button').on('click', init);

init();
