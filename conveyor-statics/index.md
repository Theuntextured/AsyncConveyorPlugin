---
title: Conveyor Statics Library
layout: page
nav_order: 6
---

# Conveyor Statics Library

---

**Conveyor Statics** is a blueprint function library that can be used to safely interact with the simulation layer of the conveyor system.

---

## Save System

---

### Get Conveyor Save Data

{bp_node_impure, Get Conveyor Save Data, target_static Conveyor Statics, out_pin_struct Out Save Data}

Waits for the current simulation tick to finish, flushes pending game thread actions, and returns save data.
For more information, see [Saving and Loading].

### Load Conveyor Save Data

{bp_node_impure, Load Conveyor Save Data, target_static Conveyor Statics, pin_struct In Save Data, pin_interface Save Handler}

Loads save data into the simulation. 
The save handler is an optional parameter that defines the way item descriptors should be loaded. You should use this if your item descriptors are generated during runtime (not data assets).
For more information, see [Saving and Loading].

## Component Registration and Manipulation

---

### Register Conveyor Component

{bp_node_impure, Register Conveyor Component, target_static Conveyor Statics, pin_transform Component Transform, pin_struct Component Data, pin_event On Register, out_pin_struct Out Handle}

Registers [Conveyor Component Data] with the subsystem and returns the handle to the registered component.
Will also call any event bound to `On Register` when the component has been registered (signature is `void()`).

---

### Unregister Conveyor Component

{bp_node_impure, Unregister Conveyor Component, target_static Conveyor Statics, ref_pin_struct Handle, out_pin_bool Return Value}

Unregisters a conveyor component via handle. returns true if successful.

---

### Is Conveyor Component Valid

{bp_node_pure, Is Conveyor Component Valid, target_static Conveyor Statics, pin_struct In Handle, out_pin_bool Return Value}

Returns true if the component associated to the handle is valid and registered.

---

### Set Conveyor Component Speed / Set Conveyor Component Spacing / Set Conveyor Component Rotation Speed

{bp_node_impure, Set Conveyor Component Speed, target_static Conveyor Statics, pin_struct Component Handle, pin_float New Speed}
{bp_node_impure, Set Conveyor Component Spacing, target_static Conveyor Statics, pin_struct Component Handle, pin_float New Spacing}
{bp_node_impure, Set Conveyor Component Rotation Speed, target_static Conveyor Statics, pin_struct Component Handle, pin_float New Rotation Speed}

Sets speed, spacing, and item rotation speed respectively for all segments associated with the component.

---

### Set Conveyor Component Item Rotation Type

{bp_node_impure, Set Conveyor Component Item Rotation Type, target_static Conveyor Statics, pin_struct Handle, pin_enum New Rotation Type, pin_rotator Desired Rotation}

Sets the item rotation type and desired rotation if the type is set to fixed for all segments associated with the component.

{: .note}
> `Fixed World` and `Fixed Local` make no difference in this case. The `Desired Rotation` will be interpreted as world space. 

---

### Get Conveyor Item At Location / Get Conveyor Item And Transform At Location

{bp_node_pure, Get Conveyor Item At Location, target_static Conveyor Statics, pin_struct Component Handle, pin_vector Location, pin_float Tolerance, out_pin_int Out Item Index, out_pin_struct OutSegmentHandle}
{bp_node_pure, Get Conveyor Item And Transform At Location, target_static Conveyor Statics, pin_struct Component Handle, pin_vector Location, pin_float Tolerance, out_pin_int Out Item Index, out_pin_struct OutSegmentHandle, out_pin_transform Out Item Transform, pin_bool Include Item Additional Transform}

Tries to find an item on a specified component with location being at most `Tolerance` distance away from the specified location. It returns the handle to the segment which the item is on and the item index (Invalid handle and index -1 if not found).

The version which returns the transform is separate since it is more expensive to calculate and not always needed. `Include Item Additional Transform` will make it so the returned transform is the actual transform of the mesh, rather than of the item itself. This is affected by the transform of the item descriptor.

---

### Get Conveyor Node At Location

{bp_node_pure, Get Conveyor Node At Location, target_static Conveyor Statics, pin_struct Component Handle, pin_vector Location, pin_float Tolerance, out_pin_struct Out Node Handle, out_pin_bool Return Value}

Tries to get a conveyor node at the specified location from a component handle with a given tolerance. 

If `Tolerance < 0`, it will return the closest node to the specified location. 

Returns true if a node was found, false otherwise.

---

## Node Functions

---

### Get Conveyor Node Handle

{bp_node_pure, Get Conveyor Node Handle, target_static Conveyor Statics, pin_struct Component Handle, pin_name Node Name, out_pin_struct Out Handle, out_pin_bool Return Value}

Gets the handle to a specific node via its unique name and component handle. The handle is valid until the next time that any component is unregistered from the subsystem.

Returns true if the node was found, as well as its handle.

---

### Attempt Insert Conveyor Item To Node

{bp_node_impure, Attempt Insert Conveyor Item To Node, target_static Conveyor Statics, pin_struct Node Handle, pin_struct Item, out_pin_bool Return Value}

Attempts to insert an item into a node via its handle. Returns true if the insertion was successful, false otherwise.

---

### Is Conveyor Node Paused

{bp_node_pure, Is Conveyor Node Paused, target_static Conveyor Statics, pin_struct Node Handle, out_pin_bool Return Value}

Returns true if the node (from handle) is paused. A paused node will not allow items to pass through.

---

### Set Conveyor Node Paused

{bp_node_impure, Set Conveyor Node Paused, target_static Conveyor Statics, pin_struct Node Handle, pin_bool Should Pause}

Sets the paused state of a node. A paused node will not allow items to pass through.

---

### Get Conveyor Node Location

{bp_node_pure, Get Conveyor Node Location, target_static Conveyor Statics, pin_struct Node Handle, out_pin_vector Return Value}

Returns the world location of a node via handle.

---

## Get Conveyor Node Segments / Get Conveyor Node In Segments / Get Conveyor Node Out Segments

{bp_node_pure, Get Conveyor Node Segments, target_static Conveyor Statics, pin_struct Node Handle, out_pin_array_struct Return Value}
{bp_node_pure, Get Conveyor Node In Segments, target_static Conveyor Statics, pin_struct Node Handle, out_pin_array_struct Return Value}
{bp_node_pure, Get Conveyor Node Out Segments, target_static Conveyor Statics, pin_struct Node Handle, out_pin_array_struct Return Value}

These functions will return handles to all segments, segments leading into, or segments leaving from a node respectively.

---

### Get Conveyor Node In Round Robin Index

{bp_node_pure, Get Conveyor Node In Round Robin Index, target_static Conveyor Statics, pin_struct Node Handle, out_pin_int}

Returns the current input round-robin segment index for the target node. This index determines what segment the node prefers to accept an item from next.

---

### Set Conveyor Node In Round Robin Index

{bp_node_impure, Set Conveyor Node In Round Robin Index, target_static Conveyor Statics, pin_struct Node Handle, pin_int New Index}

Sets the current node input round-robin index. Must be a valid index for it to take action. This index determines what segment the node prefers to accept an item from next.

---

### Get Conveyor Node Out Round Robin Index

{bp_node_pure, Get Conveyor Node Out Round Robin Index, target_static Conveyor Statics, pin_struct Node Handle, out_pin_int}

Returns the current output round-robin segment index for the target node. This index determines what segment the node prefers to send an item to next.

---

### Set Conveyor Node Out Round Robin Index

{bp_node_impure, Set Conveyor Node Out Round Robin Index, target_static Conveyor Statics, pin_struct Node Handle, pin_int New Index}

Sets the current node output round-robin index. Must be a valid index for it to take action. This index determines what segment the node prefers to send an item to next.

---

## Segment Functions

---

### Get Conveyor Segment Handle

{bp_node_pure, Get Conveyor Segment Handle, target_static Conveyor Statics, pin_struct Component Handle, pin_name Segment Name, out_pin_struct Out Handle, out_pin_bool Return Value}

Gets the handle to a specific segment via its unique name and component handle. The handle is valid until the next time that any component is unregistered from the subsystem.

Returns true if the segment was found, as well as its handle.

---

### Set Conveyor Segment Speed / Get Conveyor Segment Speed

{bp_node_impure, Set Conveyor Segment Speed, target_static Conveyor Statics, pin_struct Segment Handle, pin_float New Speed}
{bp_node_pure, Get Conveyor Segment Speed, target_static Conveyor Statics, pin_struct Segment Handle, out_pin_float Return Value}

Getter and setter for conveyor speed (in cm/s) via a segment handle. 

Cannot be negative.

---

### Set Conveyor Segment Spacing / Get Conveyor Segment Spacing

{bp_node_impure, Set Conveyor Segment Spacing, target_static Conveyor Statics, pin_struct Segment Handle, pin_float New Spacing}
{bp_node_pure, Get Conveyor Segment Spacing, target_static Conveyor Statics, pin_struct Segment Handle, out_pin_float Return Value}

Getter and setter for conveyor item spacing (in cm) via a segment handle. Cannot be <= 0. 

{: .note}
> Spacing is doubled when splitting to prevent one output from blocking the whole input even if the other outputs are clear.

---

### Set Conveyor Segment Item Rotation Speed / Get Conveyor Segment Item Rotation Speed

{bp_node_impure, Set Conveyor Segment Item Rotation Speed, target_static Conveyor Statics, pin_struct Segment Handle, pin_float New Rotation Speed}
{bp_node_pure, Get Conveyor Segment Item Rotation Speed, target_static Conveyor Statics, pin_struct Segment Handle, out_pin_float Return Value}

Getters and setters for item rotation speed (in deg/s) on a specific segment (via handle). Negative numbers will be interpreted as 0, meaning items will maintain whatever rotation they had when entering the segment.

---

## Set Conveyor Segment Item Rotation Type

{bp_node_impure, Set Conveyor Segment Item Rotation Type, target_static Conveyor Statics, pin_struct Segment Handle, pin_enum New Rotation Type, pin_rotator Desired Rotation}

Sets the item rotation type for a segment. `Desired Rotation` is the rotation used if the type is set to fixed.

{: .note}
> `Fixed World` and `Fixed Local` make no difference in this case. The `Desired Rotation` will be interpreted as world space.

---

### Get Conveyor Segment Items

{bp_node_pure, Get Conveyor Segment Items, target_static Conveyor Statics, pin_struct Segment Handle, out_pin_array_struct Return Value}

Gets **copies** of all conveyor items on a specific segment by handle.

---

### Get Conveyor Segment Item At Location

{bp_node_pure, Get Conveyor Segment Item At Location, target_static Conveyor Statics, pin_struct Segment Handle, pin_vector Location, pin_float Tolerance, out_pin_int Out Item Index, out_pin_struct Return Value}

Tries to find an item on a specified segment with location being at most `Tolerance` distance away from the specified location.

Returns the found item (invalid item if not found) and the item index (-1 if not found).

---

### Get Conveyor Segment Item And Transform At Location

{bp_node_pure, Get Conveyor Segment Item And Transform At Location, target_static Conveyor Statics, pin_struct Segment Handle, pin_vector Location, pin_float Tolerance, out_pin_struct Out Item, out_pin_int Out Item Index, out_pin_transform Out Item Transform, pin_bool Include Item Additional Transform}

Tries to find an item on a specified segment with location being at most `Tolerance` distance away from the specified location.

Returns the found item (invalid item if not found), the item index (-1 if not found) and the transform of the item. If `Include Item Additional Transform` is enabled, the transform returned will be the transform of the visual mesh, otherwise, the transform returned will be the one of the item excluding the specified transform in the item descriptor.

---

### Get Conveyor Segment Item

{bp_node_pure, Get Conveyor Segment Item, target_static Conveyor Statics, pin_struct Segment Handle, pin_int Item Index, out_pin_struct Return Value}

Gets the item from a conveyor belt from an index. Returns an invalid item if the index is not valid.

{: .note}
> The order if items in a segment is given by their position. The first item in the array is the frontmost item.

---

### Get Conveyor Segment Item And Transform

{bp_node_pure, Get Conveyor Segment Item And Transform, pin_struct Segment Handle, pin_int Item Index, out_pin_struct Out Item, out_pin_transform Out Item Transform, pin_bool Include Additional Transform}

Gets the item from a conveyor belt from an index. Returns an invalid item if the index is not valid.

Returns the found item (invalid item if not found) and the transform of the item. If `Include Item Additional Transform` is enabled, the transform returned will be the transform of the visual mesh, otherwise, the transform returned will be the one of the item excluding the specified transform in the item descriptor.

---

### Get Conveyor Segment Num Items

{bp_node_pure, Get Conveyor Segment Num Items, target_static Conveyor Statics, pin_struct Segment Handle, out_pin_int Return Value}

Returns the number of items on a conveyor segment.

---

### Get Conveyor Segment From Node / Get Conveyor Segment To Node

{bp_node_pure, Get Conveyor Segment From Node, target_static Conveyor Statics, pin_struct Segment Handle, out_pin_struct Return Value}
{bp_node_pure, Get Conveyor Segment To Node, target_static Conveyor Statics, pin_struct Segment Handle, out_pin_struct Return Value}

Get handles to the nodes before and after the target segment.

---

### Extract Conveyor Item

{bp_node_impure, Extract Conveyor Item, target_static Conveyor Statics, pin_struct Segment Handle, pin_int Item Index, out_pin_struct Return Value}

Extracts the item at the specified index on the specified segment and returns it. Returns an invalid item if the index is invalid or if it is unable to be extracted (if it is marked as being processed by a conveyor action).

---

### Attempt Modify Conveyor Item

{bp_node_impure, Attempt Modify Conveyor Item, target_static Conveyor Statics, pin_struct Segment Handle, pin_int Item Index, pin_struct New Item, out_pin_bool Return Value}

Attempts to modify the item on the given segment at the given index. What this means is that if the item index is valid, it will get replaced with the item specified. If the input item is invalid, it will delete the item.

Returns true if the change was successful and false if the index was invalid or if an extraction was attempted on an item marked for processing by a conveyor action.

---

### Attempt Insert Conveyor Item To Segment

{bp_node_impure, Attempt Insert Conveyor Item To Segment, target_static Conveyor Statics, pin_struct Segment Handle, pin_struct Item, out_pin_bool Return Value}

Attempts to insert an item into the given segment. Returns true if the insertion was successful. An unsuccessful insertion occurs when the handle is invalid, the item is invalid, or if there was not enough space for the item.

The item will be inserted at the beginning of the segment.

---

## Node Action Functions

---

### Get Conveyor Node Action

{bp_node_pure, Get Conveyor Node Action, target_static Component Handle, pin_struct Node Name, out_pin_object Return Value}

Attempts to get a conveyor node action from a specified component handle. The unique name is the one assigned to the node associated with the action. 

This means that to access the action on a node with unique name "Example", you will need to input the relevant component handle and as the `Node Name` parameter you will input "Example".

Returns `nullptr` if the node was not found or if the node does not have any action associated.

---

### Get Conveyor Node Action From Class

{bp_node_pure, Get Conveyor Node Action From Class, target_static Component Handle, pin_class Action Class, out_pin_object Return Value}

This function will search for the action associated to a conveyor component by its class. It will include subclasses as well.

If multiple actions matching the class filter are present, it will return the first one found.

Returns `nullptr` if no action was found.

---

### Get Conveyor Node Actions From Class

{bp_node_pure, Get Conveyor Node Actions From Class, target_static Component Handle, pin_class Action Class, out_pin_array_object Return Value}

This function will search for all actions associated to a conveyor component by its class. It will include subclasses as well.

---

## Item Functions

---

### Register Conveyor Item Type

{bp_node_impure, Register Conveyor Item Type, target_static Conveyor Statics, pin_interface Item Type}

Registers a conveyor item type with the system. While this is not necessary, it is recommended, especially the items are generated at runtime and garbage collection could cause issues.

This should be called once per item type per play session. Later calls are ignored.

---

### Is Conveyor Item Valid

{bp_node_pure, Is Conveyor Item Valid, target_static Conveyor Statics, pin_struct Item, out_pin_bool Return Value}

Returns true if the item is valid (Has a valid type assigned)

---

### Invalidate Conveyor Item

{bp_node_impure, Invalidate Conveyor Item, target_static Conveyor Statics, ref_pin_struct Item}

Invalidates the item, setting the type to null.

---

## Misc

---

### Get Conveyor Delta Time

{bp_node_pure, Get Conveyor Delta Time, target_static Conveyor Statics, out_pin_float Return Value}

Returns the delta time for the last simulation frame in seconds. This is different from the global world delta time, since the conveyor system can skip ticks.

---

[Conveyor Subsystem]: /AsyncConveyorPlugin/subsystem/
[Conveyor Component Data]: /AsyncConveyorPlugin/component/#manually-registering-the-data
[Item Payload]: /AsyncConveyorPlugin/item/#conveyor-item
[Conveyor Statics]: /AsyncConveyorPlugin/conveyor-statics/
[Conveyor Component]: /AsyncConveyorPlugin/component/
[Conveyor Action]: /AsyncConveyorPlugin/node-actions/
[Conveyor Actions]: /AsyncConveyorPlugin/node-actions/