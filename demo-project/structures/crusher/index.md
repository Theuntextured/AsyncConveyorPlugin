---
title: Crusher
layout: page
parent: Structures
---

# Crusher

---

The crusher will destroy any item inserted into it immediately.

![Crusher](../../../assets/images/crusher.png)

All it has is a belt, with a `AutoExtractionNodeAction` at the end, which is a default action included in the plugin, with the following code:

*AutoExtractionNodeAction.h*
```cpp
// Copyright The untextured Dev 2025. All rights reserved.

#pragma once

#include "CoreMinimal.h"
#include "ConveyorNodeAction.h"
#include "AutoExtractionNodeAction.generated.h"

UCLASS()
class CONVEYORPLUGIN_API UAutoExtractionNodeAction : public UConveyorNodeAction
{
	GENERATED_BODY()
	UAutoExtractionNodeAction();
	virtual void ProcessItem_Implementation(FConveyorItem& Item, const FConveyorNodeHandle& Node, bool& ShouldItemProceed) override;
};

```

*AutoExtractionNodeAction.cpp*
```cpp
// Copyright The untextured Dev 2025. All rights reserved.

#include "Actions/AutoExtractionNodeAction.h"

#include "Engine/Texture2D.h"

UAutoExtractionNodeAction::UAutoExtractionNodeAction()
{
	SetBehaviour(EConveyorActionBehavior::Process
				| EConveyorActionBehavior::Async);
	bIsStateless = true;
#if WITH_EDITORONLY_DATA
	Icon = GetExtractionIcon();
#endif
}

void UAutoExtractionNodeAction::ProcessItem_Implementation(FConveyorItem& Item, const FConveyorNodeHandle& Node, bool& ShouldItemProceed)
{
	Item.Invalidate();
	ShouldItemProceed = false;
}

```

If you're unfamiliar with C++, it sets the `Process` behavior on and overrides the `ProcessItem` function. All this function does is invalidate whatever item is passed.