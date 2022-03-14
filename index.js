var scale = 20;
var scatter = [];
var key = function (d) { return d.id; };
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
    .scale(scale);

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
    var radius = 8;
    scatter.push({ x: 0, y: 0, z: 0, r: radius * scale, opacity: 0.3, id: 'point_' + cnt++ });
    for (var x = -8; x <= 8; x++) {
        for (var y = -8; y <= 8; y++) {
            for (var z = -8; z <= 8; z++) {
                var dist = Math.sqrt(x * x + y * y + z * z);
                var opacity = 0.2;
                var r = 1;
                if (dist > radius - 0.1 & dist < radius + 0.1) {
                    opacity = 1.0;
                    r = 2;
                }
                scatter.push({ x: x, y: y, z: z, r: r, opacity: opacity, id: 'point_' + cnt++ });
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
