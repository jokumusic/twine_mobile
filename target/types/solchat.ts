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
          "isMut": false,
          "isSigner": true
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
          "name": "from",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
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
          "name": "contactA",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "contactB",
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
            "name": "contactA",
            "type": "publicKey"
          },
          {
            "name": "contactB",
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
          "isMut": false,
          "isSigner": true
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
          "name": "from",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
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
          "name": "contactA",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "contactB",
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
            "name": "contactA",
            "type": "publicKey"
          },
          {
            "name": "contactB",
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
    }
  ]
};
