import { ModelUtils } from "@/lib/ModelUtils";

export class Monitor {
    constructor(object) {
        const input = ModelUtils.getValueOrDefault(object, {});
        this.parent = ModelUtils.getValueOrDefault(input.parent, "");
        this.enable = ModelUtils.getValueOrDefault(input.enable, false);
        this.threshold = ModelUtils.getValueOrDefault(input.threshold, undefined);
        this.condition = ModelUtils.getValueOrDefault(input.condition, undefined);
        this.notifier = ModelUtils.getValueOrDefault(input.notifier, undefined);
    }
}
