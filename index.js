var scatter = []
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
    .origin([250, 250])
    .rotateY(startAngle)
    .rotateX(-startAngle)
    .scale(20);

function processData(data) {

    var points = svg.selectAll('circle').data(data[0], key);

    points
        .enter()
        .append('circle')
        .attr('class', '_3d')
        .attr('opacity', 0)
        .attr('cx', posPointX)
        .attr('cy', posPointY)
        .merge(points)
        .attr('r', function (d) { return d.r; })
        .attr('stroke', function (d) { 'black' })
        .attr('fill', function (d) { 'black' })
        .attr('opacity', function (d) { return d.opacity; })
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
    scatter.push({ x: 0, y: 0, z: 0, r: 100, opacity: 0.3, id: 'point_' + cnt++ });
    for (var x = -5; x <= 5; x++) {
        for (var y = -5; y <= 5; y++) {
            for (var z = -5; z <= 5; z++) {
                var dist = Math.sqrt(x * x + y * y + z * z);
                var opacity = (dist > 4.9 & dist < 5.1) ? 1.0 : 0.1;
                scatter.push({ x: x, y: y, z: z, r: 1, opacity: opacity, id: 'point_' + cnt++ });
            }
        }
    }

    var data = [
        point3d(scatter),
    ];
    processData(data);
}

function dragStart() {
    mx = d3.event.x;
    my = d3.event.y;
}

function dragged() {
    mouseX = mouseX || 0;
    mouseY = mouseY || 0;
    var beta = (d3.event.x - mx + mouseX) * Math.PI / 230;
    var alpha = (d3.event.y - my + mouseY) * Math.PI / 230 * (-1);
    var data = [
        point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(scatter),
    ];
    processData(data);
}

function dragEnd() {
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}

init();
