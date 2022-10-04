export type Twine = {
  "version": "0.1.0",
  "name": "twine",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "programMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "secondaryAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeFee",
      "accounts": [
        {
          "name": "programMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeFeeAccount",
      "accounts": [
        {
          "name": "programMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feeAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createStore",
      "accounts": [
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "secondaryAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u16"
        },
        {
          "name": "status",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateStore",
      "accounts": [
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "status",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "createProduct",
      "accounts": [
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "secondaryAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payTo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u32"
        },
        {
          "name": "status",
          "type": "u8"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "inventory",
          "type": "u64"
        },
        {
          "name": "redemptionType",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "createStoreProduct",
      "accounts": [
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "secondaryAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payTo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u32"
        },
        {
          "name": "status",
          "type": "u8"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "inventory",
          "type": "u64"
        },
        {
          "name": "redemptionType",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateProduct",
      "accounts": [
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "status",
          "type": "u8"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "inventory",
          "type": "u64"
        },
        {
          "name": "redemptionType",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "buyProduct",
      "accounts": [
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productSnapshotMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productSnapshot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicketPayment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicketPaymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payToTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payTo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyFor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u16"
        },
        {
          "name": "quantity",
          "type": "u64"
        },
        {
          "name": "agreedPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createStoreTicketTaker",
      "accounts": [
        {
          "name": "ticketTaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "taker",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "storeAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createProductTicketTaker",
      "accounts": [
        {
          "name": "ticketTaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "taker",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "product",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "productAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initiateRedemption",
      "accounts": [
        {
          "name": "redemption",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicketAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "purchaseTicketPayment",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "purchaseTicketPaymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u32"
        },
        {
          "name": "quantity",
          "type": "u64"
        }
      ]
    },
    {
      "name": "takeRedemption",
      "accounts": [
        {
          "name": "purchaseTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redemption",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketTaker",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketTakerSigner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "purchaseTicketPayment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicketPaymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payToTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payTo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelRedemption",
      "accounts": [
        {
          "name": "redemption",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicketAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "programMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "secondaryAuthority",
            "type": "publicKey"
          },
          {
            "name": "feeAccount",
            "type": "publicKey"
          },
          {
            "name": "fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "store",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "secondaryAuthority",
            "type": "publicKey"
          },
          {
            "name": "id",
            "type": "u16"
          },
          {
            "name": "tag",
            "type": "u64"
          },
          {
            "name": "productCount",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "data",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "product",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "secondaryAuthority",
            "type": "publicKey"
          },
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "tag",
            "type": "u64"
          },
          {
            "name": "isSnapshot",
            "type": "bool"
          },
          {
            "name": "usableSnapshot",
            "type": "publicKey"
          },
          {
            "name": "payTo",
            "type": "publicKey"
          },
          {
            "name": "store",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "inventory",
            "type": "u64"
          },
          {
            "name": "redemptionType",
            "type": "u8"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "data",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "productSnapshotMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "slot",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "product",
            "type": "publicKey"
          },
          {
            "name": "productSnapshot",
            "type": "publicKey"
          },
          {
            "name": "nonce",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "purchaseTicket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "slot",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "product",
            "type": "publicKey"
          },
          {
            "name": "productSnapshotMetadata",
            "type": "publicKey"
          },
          {
            "name": "productSnapshot",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "payTo",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "remainingQuantity",
            "type": "u64"
          },
          {
            "name": "redeemed",
            "type": "u64"
          },
          {
            "name": "pendingRedemption",
            "type": "u64"
          },
          {
            "name": "nonce",
            "type": "u16"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "store",
            "type": "publicKey"
          },
          {
            "name": "payment",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "ticketTaker",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "taker",
            "type": "publicKey"
          },
          {
            "name": "entityType",
            "type": "u8"
          },
          {
            "name": "entity",
            "type": "publicKey"
          },
          {
            "name": "authorizedBy",
            "type": "publicKey"
          },
          {
            "name": "enabledSlot",
            "type": "u64"
          },
          {
            "name": "enabledTimestamp",
            "type": "i64"
          },
          {
            "name": "disabledSlot",
            "type": "u64"
          },
          {
            "name": "disabledTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "redemption",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "initSlot",
            "type": "u64"
          },
          {
            "name": "closeSlot",
            "type": "u64"
          },
          {
            "name": "initTimestamp",
            "type": "i64"
          },
          {
            "name": "closeTimestamp",
            "type": "i64"
          },
          {
            "name": "store",
            "type": "publicKey"
          },
          {
            "name": "product",
            "type": "publicKey"
          },
          {
            "name": "productSnapshotMetadata",
            "type": "publicKey"
          },
          {
            "name": "productSnapshot",
            "type": "publicKey"
          },
          {
            "name": "purchaseTicket",
            "type": "publicKey"
          },
          {
            "name": "purchaseTicketSigner",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "payTo",
            "type": "publicKey"
          },
          {
            "name": "redeemQuantity",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "ticketTaker",
            "type": "publicKey"
          },
          {
            "name": "ticketTakerSigner",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "nonce",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ProductCategory",
      "docs": [
        "Used as a bitwise mask for the product category",
        "this isn't a scalable way to store all the product categories - revisit this"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "Media"
          },
          {
            "name": "Merch"
          },
          {
            "name": "Event"
          },
          {
            "name": "Social"
          }
        ]
      }
    },
    {
      "name": "ProductType",
      "docs": [
        "Used as a bitwise mask for the product type",
        "this isn't a scalable way to store all the product types - revisit this"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "Music"
          },
          {
            "name": "Video"
          },
          {
            "name": "Clothing"
          },
          {
            "name": "Concert"
          },
          {
            "name": "Conference"
          },
          {
            "name": "Award"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyInitialized",
      "msg": "AlreadyInitialized"
    },
    {
      "code": 6001,
      "name": "PublicKeyMismatch",
      "msg": "PublicKeyMismatch"
    },
    {
      "code": 6002,
      "name": "InvalidMintAuthority",
      "msg": "InvalidMintAuthority"
    },
    {
      "code": 6003,
      "name": "UninitializedAccount",
      "msg": "UninitializedAccount"
    },
    {
      "code": 6004,
      "name": "IncorrectAuthority",
      "msg": "IncorrectAuthority"
    },
    {
      "code": 6005,
      "name": "NotMutable",
      "msg": "NotMutable"
    },
    {
      "code": 6006,
      "name": "AuthorityDoesntExist",
      "msg": "authority Doesn't Exist"
    },
    {
      "code": 6007,
      "name": "PayToDoesntExist",
      "msg": "pay_to Doesn't Exist"
    },
    {
      "code": 6008,
      "name": "PriceIsGreaterThanPayment",
      "msg": "price is greater than payment"
    },
    {
      "code": 6009,
      "name": "NameIsTooLong",
      "msg": "name is too long"
    },
    {
      "code": 6010,
      "name": "DescriptionIsTooLong",
      "msg": "description is too long"
    },
    {
      "code": 6011,
      "name": "NotEnoughInventory",
      "msg": "not enough inventory"
    },
    {
      "code": 6012,
      "name": "InsufficientFunds",
      "msg": "insufficient funds"
    },
    {
      "code": 6013,
      "name": "UnableToDeductFromBuyerAccount",
      "msg": "unable to deduct from buyer account"
    },
    {
      "code": 6014,
      "name": "UnableToAddToPayToAccount",
      "msg": "unable to add to pay_to account"
    },
    {
      "code": 6015,
      "name": "ProductIsNotActive",
      "msg": "product is not active"
    },
    {
      "code": 6016,
      "name": "StoreIsNotActive",
      "msg": "store is not active"
    },
    {
      "code": 6017,
      "name": "UnableToModifySnapshot",
      "msg": "modifying snapshots is not allowed"
    },
    {
      "code": 6018,
      "name": "UnableToPurchaseSnapshot",
      "msg": "purchasing snapshots is not allowed"
    },
    {
      "code": 6019,
      "name": "InvalidTokenAccount",
      "msg": "invalid token account"
    },
    {
      "code": 6020,
      "name": "InvalidTicketTakerSigner",
      "msg": "signer isn't the ticket taker"
    },
    {
      "code": 6021,
      "name": "InvalidTicketTaker",
      "msg": "ticket taker isn't authorized to take the ticket"
    },
    {
      "code": 6022,
      "name": "InsufficientRemainingRedemptions",
      "msg": "not enough redemptions remain"
    },
    {
      "code": 6023,
      "name": "QuantityMustBeGreaterThanZero",
      "msg": "quantity must be greater than zero"
    },
    {
      "code": 6024,
      "name": "IncorrectSeed",
      "msg": "incorrect seed"
    },
    {
      "code": 6025,
      "name": "AlreadyProcessed",
      "msg": "already processed"
    },
    {
      "code": 6026,
      "name": "AlreadyRedeemed",
      "msg": "already redeemed"
    }
  ]
};

export const IDL: Twine = {
  "version": "0.1.0",
  "name": "twine",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "programMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "secondaryAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeFee",
      "accounts": [
        {
          "name": "programMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeFeeAccount",
      "accounts": [
        {
          "name": "programMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feeAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createStore",
      "accounts": [
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "secondaryAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u16"
        },
        {
          "name": "status",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateStore",
      "accounts": [
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "status",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "createProduct",
      "accounts": [
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "secondaryAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payTo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u32"
        },
        {
          "name": "status",
          "type": "u8"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "inventory",
          "type": "u64"
        },
        {
          "name": "redemptionType",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "createStoreProduct",
      "accounts": [
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "secondaryAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payTo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u32"
        },
        {
          "name": "status",
          "type": "u8"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "inventory",
          "type": "u64"
        },
        {
          "name": "redemptionType",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateProduct",
      "accounts": [
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "status",
          "type": "u8"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "inventory",
          "type": "u64"
        },
        {
          "name": "redemptionType",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "buyProduct",
      "accounts": [
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productSnapshotMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productSnapshot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicketPayment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicketPaymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payToTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payTo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyFor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u16"
        },
        {
          "name": "quantity",
          "type": "u64"
        },
        {
          "name": "agreedPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createStoreTicketTaker",
      "accounts": [
        {
          "name": "ticketTaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "taker",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "storeAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createProductTicketTaker",
      "accounts": [
        {
          "name": "ticketTaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "taker",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "product",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "productAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initiateRedemption",
      "accounts": [
        {
          "name": "redemption",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicketAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "purchaseTicketPayment",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "purchaseTicketPaymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u32"
        },
        {
          "name": "quantity",
          "type": "u64"
        }
      ]
    },
    {
      "name": "takeRedemption",
      "accounts": [
        {
          "name": "purchaseTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redemption",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketTaker",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketTakerSigner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "purchaseTicketPayment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicketPaymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payToTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payTo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelRedemption",
      "accounts": [
        {
          "name": "redemption",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTicketAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "programMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "secondaryAuthority",
            "type": "publicKey"
          },
          {
            "name": "feeAccount",
            "type": "publicKey"
          },
          {
            "name": "fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "store",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "secondaryAuthority",
            "type": "publicKey"
          },
          {
            "name": "id",
            "type": "u16"
          },
          {
            "name": "tag",
            "type": "u64"
          },
          {
            "name": "productCount",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "data",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "product",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "secondaryAuthority",
            "type": "publicKey"
          },
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "tag",
            "type": "u64"
          },
          {
            "name": "isSnapshot",
            "type": "bool"
          },
          {
            "name": "usableSnapshot",
            "type": "publicKey"
          },
          {
            "name": "payTo",
            "type": "publicKey"
          },
          {
            "name": "store",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "inventory",
            "type": "u64"
          },
          {
            "name": "redemptionType",
            "type": "u8"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "data",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "productSnapshotMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "slot",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "product",
            "type": "publicKey"
          },
          {
            "name": "productSnapshot",
            "type": "publicKey"
          },
          {
            "name": "nonce",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "purchaseTicket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "slot",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "product",
            "type": "publicKey"
          },
          {
            "name": "productSnapshotMetadata",
            "type": "publicKey"
          },
          {
            "name": "productSnapshot",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "payTo",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "remainingQuantity",
            "type": "u64"
          },
          {
            "name": "redeemed",
            "type": "u64"
          },
          {
            "name": "pendingRedemption",
            "type": "u64"
          },
          {
            "name": "nonce",
            "type": "u16"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "store",
            "type": "publicKey"
          },
          {
            "name": "payment",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "ticketTaker",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "taker",
            "type": "publicKey"
          },
          {
            "name": "entityType",
            "type": "u8"
          },
          {
            "name": "entity",
            "type": "publicKey"
          },
          {
            "name": "authorizedBy",
            "type": "publicKey"
          },
          {
            "name": "enabledSlot",
            "type": "u64"
          },
          {
            "name": "enabledTimestamp",
            "type": "i64"
          },
          {
            "name": "disabledSlot",
            "type": "u64"
          },
          {
            "name": "disabledTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "redemption",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "initSlot",
            "type": "u64"
          },
          {
            "name": "closeSlot",
            "type": "u64"
          },
          {
            "name": "initTimestamp",
            "type": "i64"
          },
          {
            "name": "closeTimestamp",
            "type": "i64"
          },
          {
            "name": "store",
            "type": "publicKey"
          },
          {
            "name": "product",
            "type": "publicKey"
          },
          {
            "name": "productSnapshotMetadata",
            "type": "publicKey"
          },
          {
            "name": "productSnapshot",
            "type": "publicKey"
          },
          {
            "name": "purchaseTicket",
            "type": "publicKey"
          },
          {
            "name": "purchaseTicketSigner",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "payTo",
            "type": "publicKey"
          },
          {
            "name": "redeemQuantity",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "ticketTaker",
            "type": "publicKey"
          },
          {
            "name": "ticketTakerSigner",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "nonce",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ProductCategory",
      "docs": [
        "Used as a bitwise mask for the product category",
        "this isn't a scalable way to store all the product categories - revisit this"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "Media"
          },
          {
            "name": "Merch"
          },
          {
            "name": "Event"
          },
          {
            "name": "Social"
          }
        ]
      }
    },
    {
      "name": "ProductType",
      "docs": [
        "Used as a bitwise mask for the product type",
        "this isn't a scalable way to store all the product types - revisit this"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "Music"
          },
          {
            "name": "Video"
          },
          {
            "name": "Clothing"
          },
          {
            "name": "Concert"
          },
          {
            "name": "Conference"
          },
          {
            "name": "Award"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyInitialized",
      "msg": "AlreadyInitialized"
    },
    {
      "code": 6001,
      "name": "PublicKeyMismatch",
      "msg": "PublicKeyMismatch"
    },
    {
      "code": 6002,
      "name": "InvalidMintAuthority",
      "msg": "InvalidMintAuthority"
    },
    {
      "code": 6003,
      "name": "UninitializedAccount",
      "msg": "UninitializedAccount"
    },
    {
      "code": 6004,
      "name": "IncorrectAuthority",
      "msg": "IncorrectAuthority"
    },
    {
      "code": 6005,
      "name": "NotMutable",
      "msg": "NotMutable"
    },
    {
      "code": 6006,
      "name": "AuthorityDoesntExist",
      "msg": "authority Doesn't Exist"
    },
    {
      "code": 6007,
      "name": "PayToDoesntExist",
      "msg": "pay_to Doesn't Exist"
    },
    {
      "code": 6008,
      "name": "PriceIsGreaterThanPayment",
      "msg": "price is greater than payment"
    },
    {
      "code": 6009,
      "name": "NameIsTooLong",
      "msg": "name is too long"
    },
    {
      "code": 6010,
      "name": "DescriptionIsTooLong",
      "msg": "description is too long"
    },
    {
      "code": 6011,
      "name": "NotEnoughInventory",
      "msg": "not enough inventory"
    },
    {
      "code": 6012,
      "name": "InsufficientFunds",
      "msg": "insufficient funds"
    },
    {
      "code": 6013,
      "name": "UnableToDeductFromBuyerAccount",
      "msg": "unable to deduct from buyer account"
    },
    {
      "code": 6014,
      "name": "UnableToAddToPayToAccount",
      "msg": "unable to add to pay_to account"
    },
    {
      "code": 6015,
      "name": "ProductIsNotActive",
      "msg": "product is not active"
    },
    {
      "code": 6016,
      "name": "StoreIsNotActive",
      "msg": "store is not active"
    },
    {
      "code": 6017,
      "name": "UnableToModifySnapshot",
      "msg": "modifying snapshots is not allowed"
    },
    {
      "code": 6018,
      "name": "UnableToPurchaseSnapshot",
      "msg": "purchasing snapshots is not allowed"
    },
    {
      "code": 6019,
      "name": "InvalidTokenAccount",
      "msg": "invalid token account"
    },
    {
      "code": 6020,
      "name": "InvalidTicketTakerSigner",
      "msg": "signer isn't the ticket taker"
    },
    {
      "code": 6021,
      "name": "InvalidTicketTaker",
      "msg": "ticket taker isn't authorized to take the ticket"
    },
    {
      "code": 6022,
      "name": "InsufficientRemainingRedemptions",
      "msg": "not enough redemptions remain"
    },
    {
      "code": 6023,
      "name": "QuantityMustBeGreaterThanZero",
      "msg": "quantity must be greater than zero"
    },
    {
      "code": 6024,
      "name": "IncorrectSeed",
      "msg": "incorrect seed"
    },
    {
      "code": 6025,
      "name": "AlreadyProcessed",
      "msg": "already processed"
    },
    {
      "code": 6026,
      "name": "AlreadyRedeemed",
      "msg": "already redeemed"
    }
  ]
};
