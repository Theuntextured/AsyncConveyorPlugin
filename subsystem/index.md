---
title: Conveyor Subsystem
layout: page
nav_order: 6
---

# Conveyor Subsystem

---

You will find that you will rarely ever interact with the Conveyor Subsystem, since the [Conveyor Statics] library convers most interactions with it either way.

However, there are a few functions available.

---

{bp_node_impure, Register Component, target Conveyor Subsystem, pin_transform Component Transform, pin_struct Component Data, out_pin_struct Out handle}

This node works just like the one in [Conveyor Statics]. There is no difference. To know how to use this function, look at the [Conveyor Component] page.

Be aware that functionality will not be immediately available. The registration is queued and will be processed as soon as possible.

---

{bp_node_impure, Unregister Component, target Conveyor Subsystem, ref_pin_struct Handle, out_pin_bool Return Value}

This node works just like the one in [Conveyor Statics]. There is no difference. To know how to use this function, look at the [Conveyor Component] page.

---

{bp_node_impure, Register Item Type, target Conveyor Subsystem, pin_interface Item Type, out_pin_bool Return Value}

Use this function to manually register a [Conveyor Item Type]. While items are registered automatically, you can pre-register them and keep the data assets alive for the duration of the world lifecycle.

Ideally, you call this once on each item type when the world starts.

{: .note}
> Registering an item will also create all the necessary data for handling the item, which are:
> * Caching the descriptor
> * Creating a visualization component and keeping it ready for rendering the item type

---

The subsystem also contains functions to validate all types of handles.

{bp_node_pure, Is Component Handle Valid, target Conveyor Subsystem, pin_struct In Handle, out_pin_bool Return Value}

{bp_node_pure, Is Node Handle Valid, target Conveyor Subsystem, pin_struct In Handle, out_pin_bool Return Value}

{bp_node_pure, Is Segment Handle Valid, target Conveyor Subsystem, pin_struct In Handle, out_pin_bool Return Value}

---

[Conveyor Subsystem]: /AsyncConveyorPlugin/subsystem/
[Conveyor Component Data]: /AsyncConveyorPlugin/component/#manually-registering-the-data
[Item Payload]: /AsyncConveyorPlugin/item/#conveyor-item
[Conveyor Statics]: /AsyncConveyorPlugin/conveyor-statics/
[Conveyor Component]: /AsyncConveyorPlugin/component/
[Conveyor Action]: /AsyncConveyorPlugin/node-actions/
[Conveyor Actions]: /AsyncConveyorPlugin/node-actions/
[Conveyor Item Type]: /AsyncConveyorPlugin/item/#conveyor-item-descriptor