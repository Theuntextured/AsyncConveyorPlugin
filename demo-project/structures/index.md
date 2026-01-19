---
title: Structures
layout: page
parent: Demo Project
nav_order: 3
---

# Structures

---

All structures in the demo project derive from the `BP_StructureBase` blueprint class, found in `Content/Demo/Blueprints/Bases`.

This class provides shared functionality for all structures, including:
- Material management
- Player interaction (covered [here](/AsyncConveyorPlugin/demo-project/player/))
- Saving and loading (Structures often override this)
- Component registration and deregistration

---

## Material Management

Under `Content/Assets/Materials` is the `M_Conveyor` material, which is used to animate the belts. Inside, it has the following nodes:

{bp j1f64n8v}

The important one here is how the `ConveyorLength` parameter is used to drive the belt speed. The material uses UV to represent where across the belt each point is, 0 meaning the start of the belt and 1 meaning the end (distance of `ConveyorLength` from the start) of it.

The setup for this was also made in the modeling software, making sure that UVs for the belt are not stretched and such that the distances are uniformly scaled.

`BP_StructureBase` then simply sets the material parameters of:
- Conveyor length
- Stripes (Internally called "Movers") which are spaced evenly with the distance between them equal to the item spacing
- Belt speed

---

## Saving and Loading

Each structure saves and loads some common data, which is:
- Class
- Transform
- [Conveyor Component] Handle

This data is saved In `BP_PlayerController` and loaded in the level blueprint. (Please do not emulate this project structure in your own project...)

**Saving:**

{bp a03tyot1}

**Loading:**

{bp yrfy9d35}

Notice how when loading, the structure is spawned with `Auto Register` set to false, we load its data, and then call `Register` on it. This is to ensure that the structure is not registered twice (once when loading the system, one when spawning) since a valid component handle will prevent this incorrect behaviour.

Each structure uses the `Load Save Data` and `Get Save Data` functions to save and load its custom data. The returned value/parameter is of type `Instanced Struct`, which you can learn more about [here](https://dev.epicgames.com/documentation/en-us/unreal-engine/BlueprintAPI/Utilities/InstancedStruct)

For more information, the [Saving and Loading] page can help.

---

## Component Registration and Deregistration

The `BP_StructureBase` blueprint disables the component's auto-register feature. This is to have control over when it is registered. The player spawns actors as previews, and we definitely do not want previews to have their own component registered. So we call `Register` when it is ready to do so. This sets collision on, sets custom stencil (to disable it appearing like a hologram), and registers the component with `Register Conveyor`. The component then gets manually de-registered on end play.

{bp x674qku8}

In addition, we must control when registration happens when loading structures. Since the system automatically saves nodes, segments, and node actions, we should not register again. To do this, registration is delayed until after the component handle is set, allowing the component to not register twice (This is handled internally: The system sees that the handle is valid and therefore skips the registration). 

[Conveyor Component]: /AsyncConveyorPlugin/component
[Saving and Loading]: /AsyncConveyorPlugin/demo-project/saving-and-loading/