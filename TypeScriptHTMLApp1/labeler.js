/// <reference path="core.ts">
"use strict";
var Core;
(function (Core) {
    var Labeler = (function () {
        function Labeler() {
        }
        Labeler.prototype.setNearest = function (offset) {
            this.source.forEach(function (segment) {
                //stroke.segments.forEach((s) => {
                //var position: Point = stroke;
                //	double dist = (output().mat.cols + output().mat.rows) * 2;
                //    Segment * seg;
                //	for (auto &seg_ptr : Processor::join(input().strokes)) {
                //    if (norm(seg_ptr- > position() - pos) < dist) {
                //        seg = seg_ptr;
                //        dist = norm(seg- > position() - pos);
                //    }
                //}
                //if (dist < pen()- > thickness() * confident_offset) {
                //    (*itr)- > set_label(seg- > label());
                //    itr = _seg_ptrs.erase(itr);
                //}
                //else {
                //    itr++;
            });
        };
        return Labeler;
    })();
    Core.Labeler = Labeler;
})(Core || (Core = {}));
//# sourceMappingURL=labeler.js.map
