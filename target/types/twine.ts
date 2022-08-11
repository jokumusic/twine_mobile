export type Twine = {
    "version": "0.1.0",
    "name": "twine",
    "instructions": [
      {
        "name": "createStore",
        "accounts": [
          {
            "name": "store",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "owner",
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
            "name": "owner",
            "isMut": false,
            "isSigner": true
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
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
        "name": "changeStoreOwner",
        "accounts": [
          {
            "name": "store",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "owner",
            "isMut": false,
            "isSigner": true
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          }
        ],
        "args": []
      }
    ],
    "accounts": [
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
              "name": "creator",
              "type": "publicKey"
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
              "name": "creator",
              "type": "publicKey"
            },
            {
              "name": "owner",
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
    ]
  };
  
  export const IDL: Twine = {
    "version": "0.1.0",
    "name": "twine",
    "instructions": [
      {
        "name": "createStore",
        "accounts": [
          {
            "name": "store",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "owner",
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
            "name": "owner",
            "isMut": false,
            "isSigner": true
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
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
        "name": "changeStoreOwner",
        "accounts": [
          {
            "name": "store",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "owner",
            "isMut": false,
            "isSigner": true
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          }
        ],
        "args": []
      }
    ],
    "accounts": [
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
              "name": "creator",
              "type": "publicKey"
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
              "name": "creator",
              "type": "publicKey"
            },
            {
              "name": "owner",
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
    ]
  };
  