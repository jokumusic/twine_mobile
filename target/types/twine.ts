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
          "name": "payTo",
          "isMut": true,
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
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
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "payTo",
            "type": "publicKey"
          },
          {
            "name": "store",
            "type": {
              "option": "publicKey"
            }
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
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "redeemed",
            "type": "u64"
          },
          {
            "name": "nonce",
            "type": "u16"
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
      "name": "StoreNumberDoesntMatchCompanyStoreCount",
      "msg": "StoreNumberDoesntMatchCompanyStoreCount"
    },
    {
      "code": 6006,
      "name": "NotMutable",
      "msg": "NotMutable"
    },
    {
      "code": 6007,
      "name": "AuthorityDoesntExist",
      "msg": "authority Doesn't Exist"
    },
    {
      "code": 6008,
      "name": "PayToDoesntExist",
      "msg": "pay_to Doesn't Exist"
    },
    {
      "code": 6009,
      "name": "PriceIsGreaterThanPayment",
      "msg": "Price Is Greater Payment"
    },
    {
      "code": 6010,
      "name": "NameIsTooLong",
      "msg": "name is too long"
    },
    {
      "code": 6011,
      "name": "DescriptionIsTooLong",
      "msg": "description is too long"
    },
    {
      "code": 6012,
      "name": "NotEnoughInventory",
      "msg": "not enough inventory"
    },
    {
      "code": 6013,
      "name": "InsufficientFunds",
      "msg": "insufficient funds"
    },
    {
      "code": 6014,
      "name": "UnableToDeductFromBuyerAccount",
      "msg": "unable to deduct from buyer account"
    },
    {
      "code": 6015,
      "name": "UnableToAddToPayToAccount",
      "msg": "unable to add to pay_to account"
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
          "name": "payTo",
          "isMut": true,
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
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
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "payTo",
            "type": "publicKey"
          },
          {
            "name": "store",
            "type": {
              "option": "publicKey"
            }
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
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "redeemed",
            "type": "u64"
          },
          {
            "name": "nonce",
            "type": "u16"
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
      "name": "StoreNumberDoesntMatchCompanyStoreCount",
      "msg": "StoreNumberDoesntMatchCompanyStoreCount"
    },
    {
      "code": 6006,
      "name": "NotMutable",
      "msg": "NotMutable"
    },
    {
      "code": 6007,
      "name": "AuthorityDoesntExist",
      "msg": "authority Doesn't Exist"
    },
    {
      "code": 6008,
      "name": "PayToDoesntExist",
      "msg": "pay_to Doesn't Exist"
    },
    {
      "code": 6009,
      "name": "PriceIsGreaterThanPayment",
      "msg": "Price Is Greater Payment"
    },
    {
      "code": 6010,
      "name": "NameIsTooLong",
      "msg": "name is too long"
    },
    {
      "code": 6011,
      "name": "DescriptionIsTooLong",
      "msg": "description is too long"
    },
    {
      "code": 6012,
      "name": "NotEnoughInventory",
      "msg": "not enough inventory"
    },
    {
      "code": 6013,
      "name": "InsufficientFunds",
      "msg": "insufficient funds"
    },
    {
      "code": 6014,
      "name": "UnableToDeductFromBuyerAccount",
      "msg": "unable to deduct from buyer account"
    },
    {
      "code": 6015,
      "name": "UnableToAddToPayToAccount",
      "msg": "unable to add to pay_to account"
    }
  ]
};
