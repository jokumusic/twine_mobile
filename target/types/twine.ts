export type Twine = {
  "version": "0.1.0",
  "name": "twine",
  "instructions": [
    {
      "name": "createCompany",
      "accounts": [
        {
          "name": "company",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
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
      "name": "createStore",
      "accounts": [
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "company",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
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
          "name": "company",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "storeNumber",
          "type": "u32"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "createProduct",
      "accounts": [
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintProductRef",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "company",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
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
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "storeNumber",
          "type": "u32"
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
          "name": "cost",
          "type": "u64"
        },
        {
          "name": "sku",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "company",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "storeCount",
            "type": "u32"
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
            "name": "company",
            "type": "publicKey"
          },
          {
            "name": "storeNumber",
            "type": "u32"
          },
          {
            "name": "owner",
            "type": "publicKey"
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
            "name": "productCount",
            "type": "u64"
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
            "name": "productNumber",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "company",
            "type": "publicKey"
          },
          {
            "name": "store",
            "type": "publicKey"
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
            "name": "cost",
            "type": "u64"
          },
          {
            "name": "sku",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "mintProductRef",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "product",
            "type": "publicKey"
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
      "name": "PublicKeyMismatch",
      "msg": "PublicKeyMismatch"
    },
    {
      "code": 6001,
      "name": "InvalidMintAuthority",
      "msg": "InvalidMintAuthority"
    },
    {
      "code": 6002,
      "name": "UninitializedAccount",
      "msg": "UninitializedAccount"
    },
    {
      "code": 6003,
      "name": "IncorrectOwner",
      "msg": "IncorrectOwner"
    },
    {
      "code": 6004,
      "name": "StoreNumberDoesntMatchCompanyStoreCount",
      "msg": "StoreNumberDoesntMatchCompanyStoreCount"
    }
  ]
};

export const IDL: Twine = {
  "version": "0.1.0",
  "name": "twine",
  "instructions": [
    {
      "name": "createCompany",
      "accounts": [
        {
          "name": "company",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
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
      "name": "createStore",
      "accounts": [
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "company",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
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
          "name": "company",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "storeNumber",
          "type": "u32"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "createProduct",
      "accounts": [
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintProductRef",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "store",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "company",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
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
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "storeNumber",
          "type": "u32"
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
          "name": "cost",
          "type": "u64"
        },
        {
          "name": "sku",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "company",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "storeCount",
            "type": "u32"
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
            "name": "company",
            "type": "publicKey"
          },
          {
            "name": "storeNumber",
            "type": "u32"
          },
          {
            "name": "owner",
            "type": "publicKey"
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
            "name": "productCount",
            "type": "u64"
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
            "name": "productNumber",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "company",
            "type": "publicKey"
          },
          {
            "name": "store",
            "type": "publicKey"
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
            "name": "cost",
            "type": "u64"
          },
          {
            "name": "sku",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "mintProductRef",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "product",
            "type": "publicKey"
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
      "name": "PublicKeyMismatch",
      "msg": "PublicKeyMismatch"
    },
    {
      "code": 6001,
      "name": "InvalidMintAuthority",
      "msg": "InvalidMintAuthority"
    },
    {
      "code": 6002,
      "name": "UninitializedAccount",
      "msg": "UninitializedAccount"
    },
    {
      "code": 6003,
      "name": "IncorrectOwner",
      "msg": "IncorrectOwner"
    },
    {
      "code": 6004,
      "name": "StoreNumberDoesntMatchCompanyStoreCount",
      "msg": "StoreNumberDoesntMatchCompanyStoreCount"
    }
  ]
};
