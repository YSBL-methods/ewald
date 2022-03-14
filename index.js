var origin = [480, 300]
var j = 10
var scale = 20
var scatter = []
var yLine = []
var beta = 0
var alpha = 0
var key = function (d) { return d.id; }
var startAngle = Math.PI / 4;
var svg = d3.select('svg')
    .call(d3.drag()
        .on('drag', dragged)
        .on('start', dragStart)
        .on('end', dragEnd))
    .append('g');
var color = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY;

var point3d = d3._3d()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .z(function (d) { return d.z; })
    .origin(origin)
    .rotateY(startAngle)
    .rotateX(-startAngle)
    .scale(scale);

function processData(data, tt) {

    var points = svg.selectAll('circle').data(data[0], key);

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
    scatter = [];
    for (var z = -j; z < j; z++) {
        for (var x = -j; x < j; x++) {
            scatter.push({ x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++ });
        }
    }

    var data = [
        point3d(scatter),
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
        point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(scatter),
    ];
    processData(data, 0);
}

function dragEnd() {
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}

d3.selectAll('button').on('click', init);

init();
