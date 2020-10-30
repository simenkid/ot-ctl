const DEF = {};

DEF.OT_ERROR_CODE = {
    'OK': 0,
    'Failed': 1,
    'Drop': 2,
    'NoBufs': 3,
    'NoRoute': 4,
    'Busy': 5,
    'Parse': 6,
    'InvalidArgs': 7,
    'Security': 8,
    'AddressQuery': 9,
    'NoAddress': 10,
    'Abort': 11,
    'NotImplemented': 12,
    'InvalidState': 13,
    'NoAck': 14,
    'ChannelAccessFailure': 15,
    'Detached': 16,
    'FcsErr': 17,
    'NoFrameReceived': 18,
    'UnknownNeighbor': 19,
    'InvalidSourceAddress': 20,
    'AddressFiltered': 21,
    'DestinationAddressFiltered': 22,
    'NotFound': 23,
    'Already': 24,
    'ReservedError25': 25,
    'Ipv6AddressCreationFailure': 26,
    'NotCapable': 27,
    'ResponseTimeout': 28,
    'Duplicated': 29,
    'ReassemblyTimeout': 30,
    'NotTmf': 31,
    'NonLowpanDataFrame': 32,
    'ReservedError33': 33,
    'LinkMarginLow': 34,
    'InvalidCommand': 35,
    'Pending': 36,
    'OtCtlTimeout': 253,        // Custom
    'SystemError': 254          // Custom
};

DEF.OT_ERROR_MESSAGE = {
    '0': 'No error.',                                               // OT_ERROR_NONE = 0
    '1': 'Operational failed.',                                     // OT_ERROR_FAILED = 1
    '2': 'Message was dropped.',                                    // OT_ERROR_DROP = 2,
    '3': 'Insufficient buffers.',                                   // OT_ERROR_NO_BUFS = 3,
    '4': 'No route available.',                                     // OT_ERROR_NO_ROUTE = 4,
    '5': 'Service is busy and could not service the operation.',    // OT_ERROR_BUSY = 5,
    '6': 'Failed to parse message.',                                // OT_ERROR_PARSE = 6,
    '7': 'Input arguments are invalid.',                            // OT_ERROR_INVALID_ARGS = 7,
    '8': 'Security checks failed.',                                 // OT_ERROR_SECURITY = 8,
    '9': 'Address resolution requires an address query operation.', // OT_ERROR_ADDRESS_QUERY = 9,
    '10': 'Address is not in the source match table.',              // OT_ERROR_NO_ADDRESS = 10,
    '11': 'Operation was aborted.',                                 // OT_ERROR_ABORT = 11,
    '12': 'Function or method is not implemented.',                 // OT_ERROR_NOT_IMPLEMENTED = 12,
    '13': 'Cannot complete due to invalid state.',                  // OT_ERROR_INVALID_STATE = 13,
    '14': 'No acknowledgment was received after macMaxFrameRetries (IEEE 802.15.4-2006).',  // OT_ERROR_NO_ACK = 14,
    '15': 'A transmission could not take place due to activity on the channel, i.e., the CSMA-CA mechanism has failed (IEEE 802.15.4-2006).',   // OT_ERROR_CHANNEL_ACCESS_FAILURE = 15,
    '16': 'Not currently attached to a Thread Partition.',          // OT_ERROR_DETACHED = 16,
    '17': 'FCS check failure while receiving.',                     // OT_ERROR_FCS = 17,
    '18': 'No frame received.',                                     // OT_ERROR_NO_FRAME_RECEIVED = 18,
    '19': 'Received a frame from an unknown neighbor.',             // OT_ERROR_UNKNOWN_NEIGHBOR = 19,
    '20': 'Received a frame from an invalid source address.',       // OT_ERROR_INVALID_SOURCE_ADDRESS = 20,
    '21': 'Received a frame filtered by the address filter (allowlisted or denylisted).',   // OT_ERROR_ADDRESS_FILTERED = 21,
    '22': 'Received a frame filtered by the destination address check.',                    // OT_ERROR_DESTINATION_ADDRESS_FILTERED = 22,
    '23': 'The requested item could not be found.',                 // OT_ERROR_NOT_FOUND = 23,
    '24': 'The operation is already in progress.',                  // OT_ERROR_ALREADY = 24,
    // 25 reserved
    '26': 'The creation of IPv6 address failed.',                   // OT_ERROR_IP6_ADDRESS_CREATION_FAILURE = 26,
    '27': 'Operation prevented by mode flags.',                     // OT_ERROR_NOT_CAPABLE = 27,
    '28': 'Coap response or acknowledgment or DNS, SNTP response not received.',    // OT_ERROR_RESPONSE_TIMEOUT = 28,
    '29': 'Received a duplicated frame.',                                           // OT_ERROR_DUPLICATED = 29,
    '30': 'Message is being dropped from reassembly list due to timeout.',          // OT_ERROR_REASSEMBLY_TIMEOUT = 30,
    '31': 'Message is not a TMF Message.',                          // OT_ERROR_NOT_TMF = 31,
    '32': 'Received a non-lowpan data frame.',                      // OT_ERROR_NOT_LOWPAN_DATA_FRAME = 32,
    // 33 reserved
    '34': 'The link margin was too low.',                           // OT_ERROR_LINK_MARGIN_LOW = 34,
    '35': 'Input (CLI) command is invalid.',                        // OT_ERROR_INVALID_COMMAND = 35,
    '36': 'Special error code used to indicate success/error status is pending and not yet known.', // OT_ERROR_PENDING = 36,
    '37': 'The number of defined errors.',                          // OT_NUM_ERRORS,
    '253': 'Ot-ctl timeout.',                                       // Custom
    '254': 'System error.',                                         // Custom
    '255': 'Generic error (should not use).',                       // OT_ERROR_GENERIC = 255,
};

DEF.WPAN_STATUS_CODE = {
    OK: 0,
    Associating: 1,
    Down: 2,
    FormFailed: 3,
    GetPropertyFailed: 4,
    JoinFailed: 5,
    LeaveFailed: 6,
    NetworkNotFound: 7,
    Offline: 8,
    ParseRequestFailed: 9,
    ScanFailed: 10,
    SetFailed: 11,
    SetGatewayFailed: 12,
    Uninitialized: 13,
    Associated: 254
};

DEF.WPAN_STATUS_MESSAGE = {
    0: "OK",
    1: "Associating",
    2: "Down",
    3: "Form failed.",
    4: "Get property failed.",
    5: "Join failed.",
    6: "Leave failed.",
    7: "Network not found.",
    8: "Offline",
    9: "Parse request failed.",
    10:"Scan failed.",
    11:"Set failed.",
    12:"Set gateway failed.",
    13:"Uninitialized",
    254: "Associated"
};

module.exports = DEF;
