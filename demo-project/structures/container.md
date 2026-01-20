---
title: Container
layout: page
parent: Structures
---

# Container

---

Containers store items. They have an input and an output on opposite sides.

![Container](../../../assets/images/container.png)

The conveyor setup above shows two separate segments (with the same component). The first one ends with a `BP_ConvainerInputAction` node action, while the second starts with a `BP_ContainerOutputAction`.

First, when the conveyor gets registered, we call the following (To create the event, we scroll at the bottom of the details panel for the conveyor component, and press the `+` button next to where it says `OnConveyorRegistered`).

{bp az5627cz}

The container also has its own very crude implementation of an inventory system which will not be covered here. If you are curious as to how it is implemented, the relevant functions are:
- Add Item
- Remove Item
- Get Save Data
- Load Save Data
- Refresh Visuals (Called when inventory is updated)

---

## Container Input Action

The input action is used to remove items from the belt and insert them into the container. We therefore must first set its behavior to `Process`, and then implement the `ProcessItem` function:

{bp lg9-wcz_}

In the above blueprint, we:
- Check if the container is valid or not. If it is not, we return. (`Should Item Proceed` should be false here, since we want to try again later)
- We cast the item data to the correct BP and try to insert it into the container.
  - If it fails, we return
  - If it succeeds, we invalidate the item, removing it from the belt.

## Container Output Action

The output action is used to remove items from the container and insert them into the belt. We therefore must first set its behavior to `Insert`, and then implement the `InsertItem` function:

{bp y4tj0cwp}

In the above blueprint, we:
- Check if the container is valid or not. If invalid, return a default (invalid) item.
- We attempt to remove an item from the container. If it fails, return a default (invalid) item.
- We return the item that has been removed, inserting it onto the belt.

