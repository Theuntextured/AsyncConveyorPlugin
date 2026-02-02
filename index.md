---
title: Home
layout: home
nav_order: 1
---


# Welcome to the Async Conveyor Plugin 3.0 wiki!

---

"Async Conveyor Plugin" is a plugin for Unreal Engine made in C++.

The goal of the plugin is to provide a way to create conveyor belts that can be updated asynchronously, offering great performance, without compromising on ease of use, modularity, and flexibility. It has been made with both C++ and Blueprint implementation in mind.

This wiki is about how you can implement the plugin into your project.

<div style="text-align: center; margin: 40px 0;" markdown="1" class="fs-6">
[View On FAB](https://www.fab.com/listings/7ebfd4f3-eec3-4204-82aa-98b7ff01ec5f){: .btn .btn-blue .mr-8}
[Try the Demo Project](https://github.com/Theuntextured/AsyncConveyorPlugin/releases/){: .btn .btn-purple}
</div>

---

## How to use the wiki

The wiki contains all the information you need to get started with the plugin. If you believe that something is missing, please feel free to [open an issue](https://github.com/Theuntextured/AsyncConveyorPlugin/issues/new), a pull request or contact me directly via discord (`theuntextured`).

If you're just getting started, I recommend reading in the following order:
1. [How does the plugin work?](#how-does-the-plugin-work): It is quite useful to know how the plugin works overall before diving into the specifics. 
2. [Creating Conveyors](/AsyncConveyorPlugin/component/): Explains how to create a conveyor belt.
3. [Conveyor Item](/AsyncConveyorPlugin/item/): Explains how to register and create items that can be carried by conveyors.
4. [Node Actions](/AsyncConveyorPlugin/node-actions/): All you need to know about node actions: objects which can efficiently handle: adding, removing and modifying items on conveyors, ticking nodes, observe items and manage round-robins.
5. [Common Issues](/AsyncConveyorPlugin/issues/): Common issues and their solutions.
6. [Demo Project](/AsyncConveyorPlugin/demo-project/): A simple project that shows how to use the plugin. It will cover most use-cases for the plugin, with an analysis on the logic and functions used.
7. [Conveyor Statics](/AsyncConveyorPlugin/conveyor-statics/): Give this a quick scan. These are functions that can be used to manipulate conveyor belts during runtime.

---

## How does the plugin work?

To properly understand how the plugin works, it is important to define three sides to it:
- The simulation layer: This is the layer that runs the simulation. It is responsible for updating the belts, running node actions, and managing belt structures.
- The synchronous layer: This is what you, as a user of the plugin, will be interacting with. It acts as an interface between the simulation layer and the game world. Without this, we could get issues such as [race conditions](https://www.geeksforgeeks.org/operating-systems/race-condition-in-operating-systems/), crashes and other instabilities.
- *(The rendering layer)*: This is what renders items on belts. You don't need to worry about it. The plugin uses a custom mesh component to ensure that rendering is as efficient as possible.

Each layer should minimize interactions with others, since interactions mean encountering barriers (to avoid the issues we discussed) that slow down the simulation.

Firstly, you should do is create a [Conveyor Component], which describes the structure of the belt. However, this in itself runs **NO LOGIC** other than registering the belt with the simulation layer.

Conveyors are structures of nodes, which are connected by belt segments. When you register a belt, nodes have location, an optional unique name, and an optional [Conveyor Action]. When in the simulation layer though, the actions are passed to the segments, since nodes can be shared between belts, while segments are unique to each belt.

Once we have our belt, we need items that can be on it. Items have two sides:
- [Item Descriptor](/AsyncConveyorPlugin/item/#conveyor-item-descriptor): The common data shared between all items of the same type. This includes
- [Item](/AsyncConveyorPlugin/item/#conveyor-item): This is what is actually on the belt. It is a struct containing a reference to the item descriptor and a payload (which you can customize).

Lastly we have [Conveyor Actions]. These are objects that you can use for recurrent tasks on belts. For example, take the following scenarios:
- A machine input needs to take in an item whenever there is space inside it. We use a conveyor action with the `Process Item` behavior to achieve this, since we should wait for an item to actually be there (which is handled optimally by the simulation layer). Using the `Extract Item` function for example would be quite inefficient, since it would need to run every tick.
- A machine is transforming an item into another inplace (on the belt). We use a conveyor action with the `Process Item` behavior to achieve this, since the action repeats on the same location every time.
- The player wants to pick up an item from the belt. We should NOT use actions here, since it is a one-time event that does not happen consistently on one location and time intervals/causation event.

As a bonus, we have [debug tools](/AsyncConveyorPlugin/console-commands/) that can help visualize the system, debug issues and monitor performance.


[Conveyor Component Data]: /AsyncConveyorPlugin/component/#manually-registering-the-data
[Item Payload]: /AsyncConveyorPlugin/item/#conveyor-item
[Conveyor Statics]: /AsyncConveyorPlugin/conveyor-statics/
[Conveyor Component]: /AsyncConveyorPlugin/component/
[Conveyor Action]: /AsyncConveyorPlugin/node-actions/
[Conveyor Actions]: /AsyncConveyorPlugin/node-actions/
