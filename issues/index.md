---
title: Common Issues
layout: page
nav_order: 10
---

# Common Issues
{: .no_toc }

---

Below are some common issues that some users have encountered or that you could run into.

{: .important}
If you have any issues or questions about the plugin, please check this page first before [opening a new issue](https://github.com/Theuntextured/AsyncConveyorPlugin/issues/new) or contacting me.

## In This Page:
{: .no_toc }

- TOC
{:toc}

---

## The plugin crashed

You can open an issue or contact me on Discord (`theuntextured`) and provide the following information:
- What were you doing when you got the crash?
- What version of the plugin you were using
- What version of Unreal Engine you were using
- Logs (You can find these under `Saved/Logs` in your project folder)
- *(Optional)* If you have an IDE attached, a stack trace would be helpful as well as autos/variables where relevant

---

## X feature doesn't work

Please check you have done everything correctly by thoroughly reading the [documentation](/AsyncConveyorPlugin/).

I am aware that the plugin may not be easy to use, which is why reading the documentation is necessary.

---

## Items on conveyors are blurry

This is likely due to TAA or TSR. They do not work well with fast-moving objects. You should use FXAA, MSAA, or SMAA instead.

---

## Items are invisible

Make sure that [items](http://127.0.0.1:4000/AsyncConveyorPlugin/item/#conveyor-item-descriptor) have been set up correctly. Is the `Get Item Descriptor` function implemented?

---

## Editing conveyor actions at runtime doesn't work

Note that the action which lies in the simulation layer is a copy of the original action you pass during registration.

To access and edit the actual action, you need to use the [`Get Conveyor Action`](http://127.0.0.1:4000/AsyncConveyorPlugin/conveyor-statics/#node-action-functions) function (or its variations).

---

## Moving actors/conveyor components doesn't work

This is intended behavior. If you want to move conveyors, you should unregister them and register them again at the new location, otherwise the simulation layer will not take account o the change.

---

## Replication when?

Replication is currently not planned. But I will consider it if there is enough demand.

---

## Any dependencies?

Yes. [Ability to Read](https://steamcommunity.com/sharedfiles/filedetails/?id=1145223801).
