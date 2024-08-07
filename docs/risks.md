---
description: Risks associated with supplying and borrowing
---

# Risks

### **Asset Risk**

Crypto assets are volatile and are subject to many risks, including but not limited to adoption, speculation, regulatory change, technology, and security risks. Any asset may be subject to large swings in value and may even become worthless, but Compound V3 architecture makes risk limited.

### **Smart Contract Risk**

We do our best to prevent all possible attacks. However, the risk of exploitation can never be fully eliminated.

{% hint style="info" %}
Note as the protocol is currently in the alpha testing phase, updates to the contracts may result in the loss of funds.
{% endhint %}

### **Liquidation**

If the value of Supplier collateral dips below the threshold determined by asset LTV (loan-to-value ratios), a portion of the debt will be liquidated with a liquidation penalty deducted from the deposited collateral.

Crypto assets are highly volatile. Due to sharp price fluctuations, liquidation may occur suddenly. There is a possibility that supplied collateral will not cover a debt position.
