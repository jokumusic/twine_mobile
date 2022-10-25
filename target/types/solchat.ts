export type Solchat = {
  "version": "0.1.0",
  "name": "solchat",
  "instructions": [
    {
      "name": "createContact",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "contact",
          "isMut": true,
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
          "name": "data",
          "type": "string"
        },
        {
          "name": "receiver",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "updateContact",
      "accounts": [
        {
          "name": "contact",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
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
          "name": "data",
          "type": "string"
        },
        {
          "name": "receiver",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "startDirectConversation",
      "accounts": [
        {
          "name": "conversation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "contact1",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "contact2",
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
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "sendDirectMessage",
      "accounts": [
        {
          "name": "conversation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "contact1",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "contact2",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
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
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "createGroup",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "contact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signerGroupContact",
          "isMut": true,
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
          "type": "u16"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "editGroup",
      "accounts": [
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signerGroupContact",
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
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "createGroupContact",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "group",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signerGroupContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "groupContact",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "contact",
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
      "name": "setGroupContactRole",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signerGroupContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "groupContact",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "role",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setGroupContactPreference",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signerGroupContact",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "preference",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "contact",
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
            "name": "receiver",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "name",
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
      "name": "directConversation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "contact1",
            "type": "publicKey"
          },
          {
            "name": "contact2",
            "type": "publicKey"
          },
          {
            "name": "messagesSize",
            "type": "u64"
          },
          {
            "name": "messages",
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    },
    {
      "name": "group",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "nonce",
            "type": "u16"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "name",
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
      "name": "groupContact",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "group",
            "type": "publicKey"
          },
          {
            "name": "contact",
            "type": "publicKey"
          },
          {
            "name": "groupContactRole",
            "type": "u8"
          },
          {
            "name": "groupContactPreference",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NameIsTooLong",
      "msg": "name is more than 100 characters"
    },
    {
      "code": 6001,
      "name": "MessageIsTooLong",
      "msg": "message is more than 1024 characters"
    },
    {
      "code": 6002,
      "name": "NotAuthorized",
      "msg": "Not Authorized"
    }
  ]
};

export const IDL: Solchat = {
  "version": "0.1.0",
  "name": "solchat",
  "instructions": [
    {
      "name": "createContact",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "contact",
          "isMut": true,
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
          "name": "data",
          "type": "string"
        },
        {
          "name": "receiver",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "updateContact",
      "accounts": [
        {
          "name": "contact",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
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
          "name": "data",
          "type": "string"
        },
        {
          "name": "receiver",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "startDirectConversation",
      "accounts": [
        {
          "name": "conversation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "contact1",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "contact2",
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
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "sendDirectMessage",
      "accounts": [
        {
          "name": "conversation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "contact1",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "contact2",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
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
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "createGroup",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "contact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signerGroupContact",
          "isMut": true,
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
          "type": "u16"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "editGroup",
      "accounts": [
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signerGroupContact",
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
          "name": "data",
          "type": "string"
        }
      ]
    },
    {
      "name": "createGroupContact",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "group",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signerGroupContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "groupContact",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "contact",
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
      "name": "setGroupContactRole",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signerGroupContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "groupContact",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "role",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setGroupContactPreference",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerContact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signerGroupContact",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "preference",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "contact",
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
            "name": "receiver",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "name",
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
      "name": "directConversation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "contact1",
            "type": "publicKey"
          },
          {
            "name": "contact2",
            "type": "publicKey"
          },
          {
            "name": "messagesSize",
            "type": "u64"
          },
          {
            "name": "messages",
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    },
    {
      "name": "group",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "nonce",
            "type": "u16"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "name",
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
      "name": "groupContact",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "group",
            "type": "publicKey"
          },
          {
            "name": "contact",
            "type": "publicKey"
          },
          {
            "name": "groupContactRole",
            "type": "u8"
          },
          {
            "name": "groupContactPreference",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NameIsTooLong",
      "msg": "name is more than 100 characters"
    },
    {
      "code": 6001,
      "name": "MessageIsTooLong",
      "msg": "message is more than 1024 characters"
    },
    {
      "code": 6002,
      "name": "NotAuthorized",
      "msg": "Not Authorized"
    }
  ]
};
