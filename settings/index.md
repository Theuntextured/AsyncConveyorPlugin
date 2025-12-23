---
title: Plugin Settings
layout: page
nav_order: 2
---

# Plugin Settings

---

{: .note }
> To access the plugin's settings, go to `Edit->Project Settings->Plugins->Conveyor Settings`

---

| Setting Name  | Setting Type  | Description | Default Value   |
|:--------------|:--------------|:------------|:----------------|
| Conveyor Spline Precision | Per Platform Int | This indicates in how many segments 1m (100 units) of conveyor spline will be split into for caching and performance reasons. | 20 |
| Items Cast Shadows | bool | Currently does nothing. In Roadmap. | false |
| Position Tolerance | float | How close should nodes be to merge? | 1 cm |
| Item Cull Distance | Per Platform Float | How far away will items be culled (hidden)? | 120m |

---

[Conveyor Subsystem]: /AsyncConveyorPlugin/subsystem/
[Conveyor Component Data]: /AsyncConveyorPlugin/component/#manually-registering-the-data
[Item Payload]: /AsyncConveyorPlugin/item/#conveyor-item
[Conveyor Statics]: /AsyncConveyorPlugin/conveyor-statics/
[Conveyor Component]: /AsyncConveyorPlugin/component/
[Conveyor Action]: /AsyncConveyorPlugin/node-actions/
[Conveyor Actions]: /AsyncConveyorPlugin/node-actions/