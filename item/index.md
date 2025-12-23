---
title: Conveyor Items
layout: page
nav_order: 4
---

# Conveyor Items

---

{: .important}
> Items have two sides to them: `Conveyor Item` and `Conveyor Item Descriptor`. <br>
> Descriptors will describe an item type, while items will be the individual items running on conveyors.

---

## Conveyor Item Descriptor

Any UObject can be a descriptor, but it is suggested that data assets are used.

In order for an object to be considered a descriptor, it must implement `Conveyor Item Interface` and it must override the `GetItemDescriptor()` function.

Included in the plugin is a data asset type, `Conveyor Item Data`, which implements the logic in the simplest way possible.

The data required is a `Conveyor Item Descriptor` struct, which is composed as follows:

![Conveyor Item Descriptor](../assets/images/conveyor_item_data_structure.png)

| Property | Type | Description |
|:---------|:-----|:------------|
| Item Name | Name | The unique identifier for the item. If two items have the same name, they will be taken as the same item. |
| Mesh | Static Mesh | The visual mesh for the item. |
| Local Mesh Transform | Transform | The local transform of the mesh. | 
| Material Overrides | Material Interface Array | Material overrides for the mesh |

## Conveyor Item

Conveyor items are simple structures. They store a `Conveyor Item Interface` object reference (in the form of a `TScriptInterface`) and a `TSharedPtr<IConveyorPayloadInterface> Payload`, accessible via C++, or via default implementation using the [Conveyor Statics] library.

Creating and invalidating items is as simple as setting the `Item Data` property to whatever you want, null if you want to invalidate the item.

With the default implementation for payloads, you can get and set payloads with the use of the `Instanced Struct` type, as follows:

{bp_node_impure, Set Item Payload, target_static Conveyor Statics, ref_pin_struct Item, pin_struct Data}
{bp_node_pure, Get Item Payload, target_static Conveyor Statics, pin_struct Item, out_pin_struct Return Value}

{: .warning}
> Be mindful that if you create your custom implementation of payloads, the default one should NOT be used in the same project, as it will cause crashes.

{: .warning}
> Item payloads will not be seen by Unreal's Garbage Collection, so you shouldn't store UObject references in them unless you are keeping them alive elsewhere.

{: .advanced}
> If you are using C++, you have full access to payloads, which are shared objects carried by the conveyor Items. They are accessible via the `TSharedPtr<IConveyorPayloadInterface> FConveyorItem::Payload` property which they have. <br>
> In order for an object to be elegible as payload, it needs to implement `IConveyorPayloadInterface`. No further requirements. You can then use `MakeShared<T>` to create payloads.

---

[Conveyor Subsystem]: /AsyncConveyorPlugin/subsystem/
[Conveyor Component Data]: /AsyncConveyorPlugin/component/#manually-registering-the-data
[Item Payload]: /AsyncConveyorPlugin/item/#conveyor-item
[Conveyor Statics]: /AsyncConveyorPlugin/conveyor-statics/
[Conveyor Component]: /AsyncConveyorPlugin/component/
[Conveyor Action]: /AsyncConveyorPlugin/node-actions/
[Conveyor Actions]: /AsyncConveyorPlugin/node-actions/