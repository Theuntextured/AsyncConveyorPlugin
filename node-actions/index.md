---
title: Node Actions
layout: page
nav_order: 5
---

# Node Actions
{: .no_toc }

---

## In This Page:
{: .no_toc }

- TOC
{:toc}

---

Node actions are automated processes which occur when certain conditions are met in the simulation. These can be assigned to any node, and can have custom behaviour via the use of classes derived from `Conveyor Node Action`.

{: .note}
> It is suggested that these actions are set up in C++, since they will be much faster to run and likely easier to develop.

{: .note}
> Be weary of where you place your actions. While you apply them to nodes, internally they are applied to the node's connected segments, which are owned by the component that created it. 
> 
> However, issues arise if two actions are applied to the same shared node and the two actions both define round-robin behavior, since they will both try to update the same segment index. In this case, which one takes over is not consistent.
 
---

Actions will have some properties that you can set:

| Property      | Type      | Description                                                                                                                                                                                                                                                                                                                         |
|:--------------|:----------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Auto Activate | bool      | Should the action auto-activate once registered? This is ignored if the action is stateless.                                                                                                                                                                                                                                        |
| Icon          | Texture2D | **EDITOR ONLY** (Defaults Only) The icon that will be displayed on the applied node when modifying components or in debug view-mode.                                                                                                                                                                                                |
| Is Stateless  | bool      | (Defaults Only) Does the action have a persistent state, or each node action should have different settings? <br>For example, needing to remember how many items passed by, or remember what inventory to be associated with etc. <br> This is for optimization reasons, by avoiding making redundant copies of identical UObjects. |
| Behaviour     | Bit-Field | (Defaults Only) What behaviours should be implemented by the action? See the table below for further information.                                                                                                                                                                                                                   |

| Behaviour Bitfield Value  | Description                                                                                                                                                                                                                                                                                                    |
|:--------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Insert                    | Wants to call InsertItem when space is available. There must be a valid segment after it for this to work.                                                                                                                                                                                                     |
| Process                   | Wants to call ProcessItem when an item reaches the node (Modify/Extract). There must be a segment before it for this to work.                                                                                                                                                                                  |
| Passive                   | Wants to call OnItemCrossed when an item has crossed the node (moved from one segment to the next). There must be a segment after it for this to work.                                                                                                                                                         |
| Tick                      | Wants to call Tick (Once per node per simulation tick).                                                                                                                                                                                                                                                        |
| Manual Input Round Robin  | Wants to call SelectRoundRobinInput when the node needs to update the input round-robin segment index.                                                                                                                                                                                                         |
| Manual Output Round Robin | Wants to call SelectRoundRobinOutput when the node needs to update the output round-robin segment index.                                                                                                                                                                                                       |
| *Async (C++ Only)*        | Keep this false this if blueprint logic is being run. Will cause the logic to be handled on a Worker Thread rather than the Game Thread. <br> If you are unsure, keep it false. <br> **Note:** Enabling this will force the native C++ implementation to be ran even if a blueprint override has been created. |

---

Actions can be set active and inactive in the simulation layer if not stateless using the [Conveyor Statics] function `GetConveyorNodeAction` (Or alternatives) to get the action and `SetActive` or `IsActive` to get the state.

{bp_node_pure, Get Conveyor Node Action, target_static Conveyor Statics, pin_struct Component Handle, pin_name Node Name, out_pin_object Return Value}
{bp_node_pure, Get Conveyor Node Action From Class, target_static Conveyor Statics, pin_struct Component Handle, pin_class Action Class, out_pin_object Return Value}
{bp_node_pure, Get Conveyor Node Actions From Class, target_static Conveyor Statics, pin_struct Component Handle, pin_class Action Class, out_pin_array_object Return Value}

{bp_node_impure, Set Active, target Conveyor Node Action Base, pin_bool New Active}
{bp_node_pure, Is Active, target Conveyor Node Action Base, out_pin_bool Return Value}

---

## Action Functions

### Insert Item

{bp_node_impure, Insert Item, target_static Conveyor Node Action, pin_struct Node, out_pin_struct Return Value}

`Insert Item` inputs a node handle and expects an item as output. If the item is invalid, no item will be inserted.

This function is called whenever there is space for an insertion on the target node. This will be called every tick as long as there is space for the insertion and the action is active.

---

### Process Item

{bp_node_impure, Process Item, target_static Conveyor Node Action, ref_pin_struct Item, pin_struct Node, out_pin_bool Should Item Proceed}

`Process Item` inputs a node handle and a reference to a `Conveyor Item`. To Remove the item from the conveyor, invalidate the item by setting the type to null, otherwise modify it as you wish.

The function is called whenever an item has reached the end of a segment and is going into a node with this action.

The return value (`Should Item Proceed`) determines whether the item should be allowed to proceed to the next segment. If false, the item will wait at the node.

---

### On Item Crossed

{bp_node_impure, On Item Crossed, target_static Conveyor Node Action, pin_struct Item, pin_struct Node}

`On Item Crossed` Inputs a const reference of the item which just crossed the node and the handle to the node. It returns nothing.

It is called **after** the item has crossed over the node. In contrast to `Process Item`, this has no return value and the item passed as a parameter is not a reference and therefore modifying it will have no effect on the actual item on the belt.

---

### Tick

{bp_node_impure, Tick, target_static Conveyor Node Action, pin_struct Node}

`Tick` will simply input the node handle and return nothing.

It will be called once per node per tick.

---

### Select Round Robin Input/Output

{bp_node_impure, Select Round Robin Input, target_static Conveyor Node Action, pin_struct Node, out_pin_int32 Return Value}
{bp_node_impure, Select Round Robin Output, target_static Conveyor Node Action, pin_struct Node, out_pin_int32 Return Value}

`Select Round Robin Input` and `Select Round Robin Output` will input the node handle and return the index of the segment to be used for the next input/output respectively.

The order of segments is determined by their order in the array passed during registration, which is the same order that appears when calling `GetInSegments()` or `GetOutSegments()` on the node.

Returning any invalid index will cause the node to not let any items pass through. (On both input and output cases)

---

{: .note}
> Conveyor actions have world context access only after being registered with the Subsystem, meaning that the `GetWorld()` function can be called on it and it will return a valid world only after being registered.

[Conveyor Component Data]: /AsyncConveyorPlugin/component/#manually-registering-the-data
[Item Payload]: /AsyncConveyorPlugin/item/#conveyor-item
[Conveyor Statics]: /AsyncConveyorPlugin/conveyor-statics/
[Conveyor Component]: /AsyncConveyorPlugin/component/
[Conveyor Action]: /AsyncConveyorPlugin/node-actions/
[Conveyor Actions]: /AsyncConveyorPlugin/node-actions/