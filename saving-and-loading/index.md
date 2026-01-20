---
title: Saving and Loading
layout: page
nav_order: 7
---

# Saving and Loading
{: .no_toc }

---

## In This Page:
{: .no_toc }

- TOC
{:toc}

---

The plugin supports saving and loading of most conveyor data; however, it is important to know ordering and precisely what is saved.

{: .note}
For a full example of saving and loading, you can see the [example project].

The two nodes that allow for saving and loading are `Get Conveyor Save Data` and `Load Conveyor Save Data`:

{bp_node_impure, Get Conveyor Save Data, target_static Conveyor Statics, pin_interface Save Handler, out_pin_struct Out Save Data}
{bp_node_impure, Load Conveyor Save Data, target_static Conveyor Statics, pin_struct In Save Data, pin_interface Save Handler}

{: .important}
> Both the above functions will wait for the current async tick to finish and will then flush (run) any pending async task that needs to run the next tick immediately, as well as any registration/unregistration.
> 
> This is to make sure that the data is saved/loaded in a consistent state. 
> 
> What this means for you is that it will be good to call the `Get Conveyor Save Data` function BEFORE other saving logic is run, since the world state can change when the function is called, therefore leading to potential duplication/voiding of items, or corruption of the save file.

---

## What is Saved?

The `Conveyor Save Data` struct which is returned by the `Get Conveyor Save Data` node contains all the save data even though it is not visible in blueprint. This data is the following:
- All registered item types
- Conveyor actions, as well as any of their properties marked as `Save Game` (Behaviour can be overridden. See below.)
- All registered nodes and segments
- All items currently running on conveyors
- Links to component handles, allowing you to carry `Conveyor Component Handle` properties across saves (Although node and segment handles will NOT be valid after reloading)

The two notable ones in the above list are conveyor actions and item types. 

---

### Conveyor Actions

{: .note}
Stateless conveyor actions are NOT serialized fully. Only their class will be saved, and the default object will be linked on load.

By default, actions are serialized (saved and loaded) by walking properties and storing or loading these from a buffer if they are marked with the `Save Game` specifier, which is added via the `UPROPERTY(SaveGame)` in C++, or in the details panel in Blueprint.

By default, whether actions are active or not is also saved.

![Save Game Specifier](../assets/images/save-game-specifier.png)

The behaviour can be changed ONLY in C++ by overriding the following two functions:
- `virtual void GetSaveData(TArray<uint8>& OutData) const;`
- `virtual void LoadSaveData(const TArray<uint8>& InData);`

There is no rule as to how you can or can't use the data in these functions: you are fully responsible for how the actions are serialized. However, note that there is no need to save the action's class, as it is already saved elsewhere.

---

### Item Types

Since you are in control of how items are created, you are also in charge of defining how item types are saved and loaded if they are created at runtime.

If your items are data assets, then you can simply ignore this section, since the logic is already implemented for you.

However, if you are creating items at runtime, you should notice that both the following functions have a parameter `TScriptInterface<IConveyorItemSaveHandler> SaveHandler`. This defines how item types are loaded and saved. If this is unset, the plugin will use the default implementation, which saves paths to the data assets and then loads them from the saved path.

To create your own save handler, you should implement the `Conveyor Item Save Handler` interface, which has the following functions that should be implemented:

{bp_node_impure, Save Conveyor Item, target Conveyor Item Save Handler, pin_interface Item Type, out_pin_struct Return Value}
{bp_node_impure, Load Conveyor Item, target Conveyor Item Save Handler, pin_struct Data, out_pin_interface Return Value}

For saving, the input is the item type, and the output should be a `Conveyor Item Save Signature` struct.

For loading the input is the `Conveyor Item Save Signature` struct, and the output should be the item type.

The `Conveyor Item Save Signature` struct has the following properties:

| Property Name | Type             | Description                                                                                           |
|---------------|------------------|-------------------------------------------------------------------------------------------------------|
| Is Asset      | Bool             | True if you are storing a path to an asset, otherwise keep false if the item is generated at runtime. |
| Asset Path    | Soft Object Path | If the item is an asset, this will be its path.                                                       |
| Generic Data  | Byte Array       | The item used to re-create the item type when loading.                                                |

If you're working in C++, then you probably want to use the `FArchive` system to save/load the generic data, otherwise, there are two helper functions which you can use to work with the `Conveyor Item Save Signature`:

{bp_node_pure, Get Conveyor Item Signature From String, target_static Conveyor Item Save Handler Library, pin_string In String, out_pin_struct Return Value}
{bp_node_pure, Get String From Item Save Signature, target_static Conveyor Item Save Handler Library, pin_struct Save Signature, out_pin_string Return Value}

These functions will help you by converting `Conveyor Item Save Signature` to and from a string, which you can build and use however you need.

[example project]: /AsyncConveyorPlugin/demo-project/