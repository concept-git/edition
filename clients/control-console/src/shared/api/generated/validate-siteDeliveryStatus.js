// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const siteDeliveryStatusInput = validate1320;
const schema1477 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        siteId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'siteId'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/siteDeliveryStatusInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1320(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/siteDeliveryStatusInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1320.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.path === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'path' },
        message: "must have required property '" + 'path' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err1 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.siteId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err3 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          } else {
            const err4 = {
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
        if (data0.siteId !== undefined) {
          let data2 = data0.siteId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err5 = {
                instancePath: instancePath + '/path/siteId',
                schemaPath: '#/properties/path/properties/siteId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          } else {
            const err6 = {
              instancePath: instancePath + '/path/siteId',
              schemaPath: '#/properties/path/properties/siteId/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.query !== undefined) {
      let data3 = data.query;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.fields !== undefined) {
          let data4 = data3.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err8 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err9 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
          } else {
            const err10 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
  }
  validate1320.errors = vErrors;
  return errors === 0;
}
validate1320.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const siteDeliveryStatusOutput = validate1321;
const schema1478 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/Status' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialStatus',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/siteDeliveryStatusOutput',
};
const schema1479 = {
  type: 'object',
  properties: {
    enabled: { type: 'boolean' },
    status: {
      type: 'string',
      enum: [
        'disabled',
        'queued',
        'running',
        'retrying',
        'failed',
        'completed',
        'access_pending',
      ],
    },
    targetEpoch: { type: 'integer', format: 'int64' },
    onlineEpoch: { type: ['integer', 'null'], format: 'int64' },
    primaryHost: { type: ['string', 'null'] },
    spaces: {
      type: 'array',
      items: { $ref: '#/components/schemas/OnlineSpace' },
    },
    error: { type: ['string', 'null'] },
    canRetry: { type: 'boolean' },
    searchStatus: { type: ['string', 'null'] },
    desired: {
      anyOf: [{ $ref: '#/components/schemas/Desired' }, { type: 'null' }],
    },
    current: {
      anyOf: [{ $ref: '#/components/schemas/Current' }, { type: 'null' }],
    },
    terminal: { type: 'boolean' },
    successful: { type: 'boolean' },
    nextPollAfterSeconds: { type: 'integer', format: 'int32' },
  },
  required: ['enabled', 'status', 'successful', 'targetEpoch', 'terminal'],
};
const schema1480 = {
  type: 'object',
  properties: {
    spaceId: { type: 'string', format: 'uuid' },
    slug: { type: 'string' },
    releaseId: { type: ['string', 'null'], format: 'uuid' },
    readerHref: { type: ['string', 'null'] },
  },
};
const schema1481 = {
  type: 'object',
  properties: {
    epoch: { type: 'integer', format: 'int64' },
    spaces: {
      type: 'array',
      items: { $ref: '#/components/schemas/OnlineSpace' },
    },
  },
};
function validate1323(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1323.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.epoch !== undefined) {
      let data0 = data.epoch;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/epoch',
          schemaPath: '#/properties/epoch/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data1 = data.spaces;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
            if (data2.spaceId !== undefined) {
              let data3 = data2.spaceId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err1 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/OnlineSpace/properties/spaceId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err1];
                  } else {
                    vErrors.push(err1);
                  }
                  errors++;
                }
              } else {
                const err2 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/spaceId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
            if (data2.slug !== undefined) {
              if (typeof data2.slug !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/slug/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err3];
                } else {
                  vErrors.push(err3);
                }
                errors++;
              }
            }
            if (data2.releaseId !== undefined) {
              let data5 = data2.releaseId;
              if (typeof data5 !== 'string' && data5 !== null) {
                const err4 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/releaseId',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/releaseId/type',
                  keyword: 'type',
                  params: { type: schema1480.properties.releaseId.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err5 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/releaseId',
                    schemaPath:
                      '#/components/schemas/OnlineSpace/properties/releaseId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err5];
                  } else {
                    vErrors.push(err5);
                  }
                  errors++;
                }
              }
            }
            if (data2.readerHref !== undefined) {
              let data6 = data2.readerHref;
              if (typeof data6 !== 'string' && data6 !== null) {
                const err6 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/readerHref',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/readerHref/type',
                  keyword: 'type',
                  params: { type: schema1480.properties.readerHref.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
          } else {
            const err7 = {
              instancePath: instancePath + '/spaces/' + i0,
              schemaPath: '#/components/schemas/OnlineSpace/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
  } else {
    const err9 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate1323.errors = vErrors;
  return errors === 0;
}
validate1323.evaluated = {
  props: { epoch: true, spaces: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1483 = {
  type: 'object',
  properties: {
    epoch: { type: 'integer', format: 'int64' },
    primaryHost: { type: ['string', 'null'] },
    readerHref: { type: ['string', 'null'] },
    spaces: {
      type: 'array',
      items: { $ref: '#/components/schemas/OnlineSpace' },
    },
    readable: {
      type: 'boolean',
      description:
        'The actual snapshot is present and has no pending site fence. Each Reader request still enforces current reader policy; this does not prove anonymous access.',
    },
    searchStatus: { type: ['string', 'null'] },
  },
};
function validate1325(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1325.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.epoch !== undefined) {
      let data0 = data.epoch;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/epoch',
          schemaPath: '#/properties/epoch/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.primaryHost !== undefined) {
      let data1 = data.primaryHost;
      if (typeof data1 !== 'string' && data1 !== null) {
        const err1 = {
          instancePath: instancePath + '/primaryHost',
          schemaPath: '#/properties/primaryHost/type',
          keyword: 'type',
          params: { type: schema1483.properties.primaryHost.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.readerHref !== undefined) {
      let data2 = data.readerHref;
      if (typeof data2 !== 'string' && data2 !== null) {
        const err2 = {
          instancePath: instancePath + '/readerHref',
          schemaPath: '#/properties/readerHref/type',
          keyword: 'type',
          params: { type: schema1483.properties.readerHref.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data3 = data.spaces;
      if (Array.isArray(data3)) {
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data4 = data3[i0];
          if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
            if (data4.spaceId !== undefined) {
              let data5 = data4.spaceId;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err3 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/OnlineSpace/properties/spaceId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err3];
                  } else {
                    vErrors.push(err3);
                  }
                  errors++;
                }
              } else {
                const err4 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/spaceId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data4.slug !== undefined) {
              if (typeof data4.slug !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/slug/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err5];
                } else {
                  vErrors.push(err5);
                }
                errors++;
              }
            }
            if (data4.releaseId !== undefined) {
              let data7 = data4.releaseId;
              if (typeof data7 !== 'string' && data7 !== null) {
                const err6 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/releaseId',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/releaseId/type',
                  keyword: 'type',
                  params: { type: schema1480.properties.releaseId.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
              if (typeof data7 === 'string') {
                if (!formats0.test(data7)) {
                  const err7 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/releaseId',
                    schemaPath:
                      '#/components/schemas/OnlineSpace/properties/releaseId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err7];
                  } else {
                    vErrors.push(err7);
                  }
                  errors++;
                }
              }
            }
            if (data4.readerHref !== undefined) {
              let data8 = data4.readerHref;
              if (typeof data8 !== 'string' && data8 !== null) {
                const err8 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/readerHref',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/readerHref/type',
                  keyword: 'type',
                  params: { type: schema1480.properties.readerHref.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
          } else {
            const err9 = {
              instancePath: instancePath + '/spaces/' + i0,
              schemaPath: '#/components/schemas/OnlineSpace/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.readable !== undefined) {
      if (typeof data.readable !== 'boolean') {
        const err11 = {
          instancePath: instancePath + '/readable',
          schemaPath: '#/properties/readable/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.searchStatus !== undefined) {
      let data10 = data.searchStatus;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err12 = {
          instancePath: instancePath + '/searchStatus',
          schemaPath: '#/properties/searchStatus/type',
          keyword: 'type',
          params: { type: schema1483.properties.searchStatus.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err13];
    } else {
      vErrors.push(err13);
    }
    errors++;
  }
  validate1325.errors = vErrors;
  return errors === 0;
}
validate1325.evaluated = {
  props: {
    epoch: true,
    primaryHost: true,
    readerHref: true,
    spaces: true,
    readable: true,
    searchStatus: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1322(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1322.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.enabled === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'enabled' },
        message: "must have required property '" + 'enabled' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.status === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'status' },
        message: "must have required property '" + 'status' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.successful === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'successful' },
        message: "must have required property '" + 'successful' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.targetEpoch === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'targetEpoch' },
        message: "must have required property '" + 'targetEpoch' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.terminal === undefined) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'terminal' },
        message: "must have required property '" + 'terminal' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.enabled !== undefined) {
      if (typeof data.enabled !== 'boolean') {
        const err5 = {
          instancePath: instancePath + '/enabled',
          schemaPath: '#/properties/enabled/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.status !== undefined) {
      let data1 = data.status;
      if (typeof data1 !== 'string') {
        const err6 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (!(
        data1 === 'disabled' ||
        data1 === 'queued' ||
        data1 === 'running' ||
        data1 === 'retrying' ||
        data1 === 'failed' ||
        data1 === 'completed' ||
        data1 === 'access_pending'
      )) {
        const err7 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema1479.properties.status.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.targetEpoch !== undefined) {
      let data2 = data.targetEpoch;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err8 = {
          instancePath: instancePath + '/targetEpoch',
          schemaPath: '#/properties/targetEpoch/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.onlineEpoch !== undefined) {
      let data3 = data.onlineEpoch;
      if (
        !(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3)) &&
        data3 !== null
      ) {
        const err9 = {
          instancePath: instancePath + '/onlineEpoch',
          schemaPath: '#/properties/onlineEpoch/type',
          keyword: 'type',
          params: { type: schema1479.properties.onlineEpoch.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.primaryHost !== undefined) {
      let data4 = data.primaryHost;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err10 = {
          instancePath: instancePath + '/primaryHost',
          schemaPath: '#/properties/primaryHost/type',
          keyword: 'type',
          params: { type: schema1479.properties.primaryHost.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data5 = data.spaces;
      if (Array.isArray(data5)) {
        const len0 = data5.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data6 = data5[i0];
          if (data6 && typeof data6 == 'object' && !Array.isArray(data6)) {
            if (data6.spaceId !== undefined) {
              let data7 = data6.spaceId;
              if (typeof data7 === 'string') {
                if (!formats0.test(data7)) {
                  const err11 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/OnlineSpace/properties/spaceId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err11];
                  } else {
                    vErrors.push(err11);
                  }
                  errors++;
                }
              } else {
                const err12 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/spaceId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data6.slug !== undefined) {
              if (typeof data6.slug !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/slug/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
            }
            if (data6.releaseId !== undefined) {
              let data9 = data6.releaseId;
              if (typeof data9 !== 'string' && data9 !== null) {
                const err14 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/releaseId',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/releaseId/type',
                  keyword: 'type',
                  params: { type: schema1480.properties.releaseId.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
              if (typeof data9 === 'string') {
                if (!formats0.test(data9)) {
                  const err15 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/releaseId',
                    schemaPath:
                      '#/components/schemas/OnlineSpace/properties/releaseId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err15];
                  } else {
                    vErrors.push(err15);
                  }
                  errors++;
                }
              }
            }
            if (data6.readerHref !== undefined) {
              let data10 = data6.readerHref;
              if (typeof data10 !== 'string' && data10 !== null) {
                const err16 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/readerHref',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/readerHref/type',
                  keyword: 'type',
                  params: { type: schema1480.properties.readerHref.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
            }
          } else {
            const err17 = {
              instancePath: instancePath + '/spaces/' + i0,
              schemaPath: '#/components/schemas/OnlineSpace/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.error !== undefined) {
      let data11 = data.error;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err19 = {
          instancePath: instancePath + '/error',
          schemaPath: '#/properties/error/type',
          keyword: 'type',
          params: { type: schema1479.properties.error.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.canRetry !== undefined) {
      if (typeof data.canRetry !== 'boolean') {
        const err20 = {
          instancePath: instancePath + '/canRetry',
          schemaPath: '#/properties/canRetry/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.searchStatus !== undefined) {
      let data13 = data.searchStatus;
      if (typeof data13 !== 'string' && data13 !== null) {
        const err21 = {
          instancePath: instancePath + '/searchStatus',
          schemaPath: '#/properties/searchStatus/type',
          keyword: 'type',
          params: { type: schema1479.properties.searchStatus.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.desired !== undefined) {
      let data14 = data.desired;
      const _errs31 = errors;
      let valid5 = false;
      const _errs32 = errors;
      if (
        !validate1323(data14, {
          instancePath: instancePath + '/desired',
          parentData: data,
          parentDataProperty: 'desired',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1323.errors
            : vErrors.concat(validate1323.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs32 === errors;
      valid5 = valid5 || _valid0;
      if (_valid0) {
        var props0 = {};
        props0.epoch = true;
        props0.spaces = true;
      }
      const _errs33 = errors;
      if (data14 !== null) {
        const err22 = {
          instancePath: instancePath + '/desired',
          schemaPath: '#/properties/desired/anyOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
      var _valid0 = _errs33 === errors;
      valid5 = valid5 || _valid0;
      if (!valid5) {
        const err23 = {
          instancePath: instancePath + '/desired',
          schemaPath: '#/properties/desired/anyOf',
          keyword: 'anyOf',
          params: {},
          message: 'must match a schema in anyOf',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      } else {
        errors = _errs31;
        if (vErrors !== null) {
          if (_errs31) {
            vErrors.length = _errs31;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.current !== undefined) {
      let data15 = data.current;
      const _errs36 = errors;
      let valid6 = false;
      const _errs37 = errors;
      if (
        !validate1325(data15, {
          instancePath: instancePath + '/current',
          parentData: data,
          parentDataProperty: 'current',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1325.errors
            : vErrors.concat(validate1325.errors);
        errors = vErrors.length;
      }
      var _valid1 = _errs37 === errors;
      valid6 = valid6 || _valid1;
      if (_valid1) {
        var props1 = {};
        props1.epoch = true;
        props1.primaryHost = true;
        props1.readerHref = true;
        props1.spaces = true;
        props1.readable = true;
        props1.searchStatus = true;
      }
      const _errs38 = errors;
      if (data15 !== null) {
        const err24 = {
          instancePath: instancePath + '/current',
          schemaPath: '#/properties/current/anyOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
      var _valid1 = _errs38 === errors;
      valid6 = valid6 || _valid1;
      if (!valid6) {
        const err25 = {
          instancePath: instancePath + '/current',
          schemaPath: '#/properties/current/anyOf',
          keyword: 'anyOf',
          params: {},
          message: 'must match a schema in anyOf',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      } else {
        errors = _errs36;
        if (vErrors !== null) {
          if (_errs36) {
            vErrors.length = _errs36;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.terminal !== undefined) {
      if (typeof data.terminal !== 'boolean') {
        const err26 = {
          instancePath: instancePath + '/terminal',
          schemaPath: '#/properties/terminal/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.successful !== undefined) {
      if (typeof data.successful !== 'boolean') {
        const err27 = {
          instancePath: instancePath + '/successful',
          schemaPath: '#/properties/successful/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.nextPollAfterSeconds !== undefined) {
      let data18 = data.nextPollAfterSeconds;
      if (!(typeof data18 == 'number' && !(data18 % 1) && !isNaN(data18))) {
        const err28 = {
          instancePath: instancePath + '/nextPollAfterSeconds',
          schemaPath: '#/properties/nextPollAfterSeconds/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
    }
  } else {
    const err29 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err29];
    } else {
      vErrors.push(err29);
    }
    errors++;
  }
  validate1322.errors = vErrors;
  return errors === 0;
}
validate1322.evaluated = {
  props: {
    enabled: true,
    status: true,
    targetEpoch: true,
    onlineEpoch: true,
    primaryHost: true,
    spaces: true,
    error: true,
    canRetry: true,
    searchStatus: true,
    desired: true,
    current: true,
    terminal: true,
    successful: true,
    nextPollAfterSeconds: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1485 = {
  type: 'object',
  properties: {
    enabled: { type: 'boolean' },
    status: {
      type: 'string',
      enum: [
        'disabled',
        'queued',
        'running',
        'retrying',
        'failed',
        'completed',
        'access_pending',
      ],
    },
    targetEpoch: { type: 'integer', format: 'int64' },
    onlineEpoch: { type: ['integer', 'null'], format: 'int64' },
    primaryHost: { type: ['string', 'null'] },
    spaces: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialOnlineSpace' },
    },
    error: { type: ['string', 'null'] },
    canRetry: { type: 'boolean' },
    searchStatus: { type: ['string', 'null'] },
    desired: {
      anyOf: [{ $ref: '#/components/schemas/Desired' }, { type: 'null' }],
    },
    current: {
      anyOf: [{ $ref: '#/components/schemas/Current' }, { type: 'null' }],
    },
    terminal: { type: 'boolean' },
    successful: { type: 'boolean' },
    nextPollAfterSeconds: { type: 'integer', format: 'int32' },
  },
};
const schema1486 = {
  type: 'object',
  properties: {
    spaceId: { type: 'string', format: 'uuid' },
    slug: { type: 'string' },
    releaseId: { type: ['string', 'null'], format: 'uuid' },
    readerHref: { type: ['string', 'null'] },
  },
};
function validate1328(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1328.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.enabled !== undefined) {
      if (typeof data.enabled !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/enabled',
          schemaPath: '#/properties/enabled/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.status !== undefined) {
      let data1 = data.status;
      if (typeof data1 !== 'string') {
        const err1 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      if (!(
        data1 === 'disabled' ||
        data1 === 'queued' ||
        data1 === 'running' ||
        data1 === 'retrying' ||
        data1 === 'failed' ||
        data1 === 'completed' ||
        data1 === 'access_pending'
      )) {
        const err2 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema1485.properties.status.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.targetEpoch !== undefined) {
      let data2 = data.targetEpoch;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err3 = {
          instancePath: instancePath + '/targetEpoch',
          schemaPath: '#/properties/targetEpoch/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.onlineEpoch !== undefined) {
      let data3 = data.onlineEpoch;
      if (
        !(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3)) &&
        data3 !== null
      ) {
        const err4 = {
          instancePath: instancePath + '/onlineEpoch',
          schemaPath: '#/properties/onlineEpoch/type',
          keyword: 'type',
          params: { type: schema1485.properties.onlineEpoch.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.primaryHost !== undefined) {
      let data4 = data.primaryHost;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err5 = {
          instancePath: instancePath + '/primaryHost',
          schemaPath: '#/properties/primaryHost/type',
          keyword: 'type',
          params: { type: schema1485.properties.primaryHost.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data5 = data.spaces;
      if (Array.isArray(data5)) {
        const len0 = data5.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data6 = data5[i0];
          if (data6 && typeof data6 == 'object' && !Array.isArray(data6)) {
            if (data6.spaceId !== undefined) {
              let data7 = data6.spaceId;
              if (typeof data7 === 'string') {
                if (!formats0.test(data7)) {
                  const err6 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/PartialOnlineSpace/properties/spaceId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err6];
                  } else {
                    vErrors.push(err6);
                  }
                  errors++;
                }
              } else {
                const err7 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/PartialOnlineSpace/properties/spaceId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
            if (data6.slug !== undefined) {
              if (typeof data6.slug !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/PartialOnlineSpace/properties/slug/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data6.releaseId !== undefined) {
              let data9 = data6.releaseId;
              if (typeof data9 !== 'string' && data9 !== null) {
                const err9 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/releaseId',
                  schemaPath:
                    '#/components/schemas/PartialOnlineSpace/properties/releaseId/type',
                  keyword: 'type',
                  params: { type: schema1486.properties.releaseId.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
              if (typeof data9 === 'string') {
                if (!formats0.test(data9)) {
                  const err10 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/releaseId',
                    schemaPath:
                      '#/components/schemas/PartialOnlineSpace/properties/releaseId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err10];
                  } else {
                    vErrors.push(err10);
                  }
                  errors++;
                }
              }
            }
            if (data6.readerHref !== undefined) {
              let data10 = data6.readerHref;
              if (typeof data10 !== 'string' && data10 !== null) {
                const err11 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/readerHref',
                  schemaPath:
                    '#/components/schemas/PartialOnlineSpace/properties/readerHref/type',
                  keyword: 'type',
                  params: { type: schema1486.properties.readerHref.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
          } else {
            const err12 = {
              instancePath: instancePath + '/spaces/' + i0,
              schemaPath: '#/components/schemas/PartialOnlineSpace/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
      } else {
        const err13 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.error !== undefined) {
      let data11 = data.error;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err14 = {
          instancePath: instancePath + '/error',
          schemaPath: '#/properties/error/type',
          keyword: 'type',
          params: { type: schema1485.properties.error.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.canRetry !== undefined) {
      if (typeof data.canRetry !== 'boolean') {
        const err15 = {
          instancePath: instancePath + '/canRetry',
          schemaPath: '#/properties/canRetry/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.searchStatus !== undefined) {
      let data13 = data.searchStatus;
      if (typeof data13 !== 'string' && data13 !== null) {
        const err16 = {
          instancePath: instancePath + '/searchStatus',
          schemaPath: '#/properties/searchStatus/type',
          keyword: 'type',
          params: { type: schema1485.properties.searchStatus.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.desired !== undefined) {
      let data14 = data.desired;
      const _errs31 = errors;
      let valid5 = false;
      const _errs32 = errors;
      if (
        !validate1323(data14, {
          instancePath: instancePath + '/desired',
          parentData: data,
          parentDataProperty: 'desired',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1323.errors
            : vErrors.concat(validate1323.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs32 === errors;
      valid5 = valid5 || _valid0;
      if (_valid0) {
        var props0 = {};
        props0.epoch = true;
        props0.spaces = true;
      }
      const _errs33 = errors;
      if (data14 !== null) {
        const err17 = {
          instancePath: instancePath + '/desired',
          schemaPath: '#/properties/desired/anyOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
      var _valid0 = _errs33 === errors;
      valid5 = valid5 || _valid0;
      if (!valid5) {
        const err18 = {
          instancePath: instancePath + '/desired',
          schemaPath: '#/properties/desired/anyOf',
          keyword: 'anyOf',
          params: {},
          message: 'must match a schema in anyOf',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      } else {
        errors = _errs31;
        if (vErrors !== null) {
          if (_errs31) {
            vErrors.length = _errs31;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.current !== undefined) {
      let data15 = data.current;
      const _errs36 = errors;
      let valid6 = false;
      const _errs37 = errors;
      if (
        !validate1325(data15, {
          instancePath: instancePath + '/current',
          parentData: data,
          parentDataProperty: 'current',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1325.errors
            : vErrors.concat(validate1325.errors);
        errors = vErrors.length;
      }
      var _valid1 = _errs37 === errors;
      valid6 = valid6 || _valid1;
      if (_valid1) {
        var props1 = {};
        props1.epoch = true;
        props1.primaryHost = true;
        props1.readerHref = true;
        props1.spaces = true;
        props1.readable = true;
        props1.searchStatus = true;
      }
      const _errs38 = errors;
      if (data15 !== null) {
        const err19 = {
          instancePath: instancePath + '/current',
          schemaPath: '#/properties/current/anyOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
      var _valid1 = _errs38 === errors;
      valid6 = valid6 || _valid1;
      if (!valid6) {
        const err20 = {
          instancePath: instancePath + '/current',
          schemaPath: '#/properties/current/anyOf',
          keyword: 'anyOf',
          params: {},
          message: 'must match a schema in anyOf',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      } else {
        errors = _errs36;
        if (vErrors !== null) {
          if (_errs36) {
            vErrors.length = _errs36;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.terminal !== undefined) {
      if (typeof data.terminal !== 'boolean') {
        const err21 = {
          instancePath: instancePath + '/terminal',
          schemaPath: '#/properties/terminal/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.successful !== undefined) {
      if (typeof data.successful !== 'boolean') {
        const err22 = {
          instancePath: instancePath + '/successful',
          schemaPath: '#/properties/successful/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.nextPollAfterSeconds !== undefined) {
      let data18 = data.nextPollAfterSeconds;
      if (!(typeof data18 == 'number' && !(data18 % 1) && !isNaN(data18))) {
        const err23 = {
          instancePath: instancePath + '/nextPollAfterSeconds',
          schemaPath: '#/properties/nextPollAfterSeconds/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
  } else {
    const err24 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err24];
    } else {
      vErrors.push(err24);
    }
    errors++;
  }
  validate1328.errors = vErrors;
  return errors === 0;
}
validate1328.evaluated = {
  props: {
    enabled: true,
    status: true,
    targetEpoch: true,
    onlineEpoch: true,
    primaryHost: true,
    spaces: true,
    error: true,
    canRetry: true,
    searchStatus: true,
    desired: true,
    current: true,
    terminal: true,
    successful: true,
    nextPollAfterSeconds: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1321(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/siteDeliveryStatusOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1321.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate1322(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1322.errors
        : vErrors.concat(validate1322.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.enabled = true;
    props0.status = true;
    props0.targetEpoch = true;
    props0.onlineEpoch = true;
    props0.primaryHost = true;
    props0.spaces = true;
    props0.error = true;
    props0.canRetry = true;
    props0.searchStatus = true;
    props0.desired = true;
    props0.current = true;
    props0.terminal = true;
    props0.successful = true;
    props0.nextPollAfterSeconds = true;
  }
  const _errs2 = errors;
  if (
    !validate1328(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1328.errors
        : vErrors.concat(validate1328.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.enabled = true;
      props0.status = true;
      props0.targetEpoch = true;
      props0.onlineEpoch = true;
      props0.primaryHost = true;
      props0.spaces = true;
      props0.error = true;
      props0.canRetry = true;
      props0.searchStatus = true;
      props0.desired = true;
      props0.current = true;
      props0.terminal = true;
      props0.successful = true;
      props0.nextPollAfterSeconds = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate1321.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1321.evaluated = { dynamicProps: true, dynamicItems: false };
export const siteDeliveryStatusOutputFull = validate1332;
const schema1487 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Status',
  $id: 'https://edition.invalid/validators/siteDeliveryStatusOutputFull',
};
function validate1333(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1333.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.enabled === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'enabled' },
        message: "must have required property '" + 'enabled' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.status === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'status' },
        message: "must have required property '" + 'status' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.successful === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'successful' },
        message: "must have required property '" + 'successful' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.targetEpoch === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'targetEpoch' },
        message: "must have required property '" + 'targetEpoch' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.terminal === undefined) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'terminal' },
        message: "must have required property '" + 'terminal' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.enabled !== undefined) {
      if (typeof data.enabled !== 'boolean') {
        const err5 = {
          instancePath: instancePath + '/enabled',
          schemaPath: '#/properties/enabled/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.status !== undefined) {
      let data1 = data.status;
      if (typeof data1 !== 'string') {
        const err6 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (!(
        data1 === 'disabled' ||
        data1 === 'queued' ||
        data1 === 'running' ||
        data1 === 'retrying' ||
        data1 === 'failed' ||
        data1 === 'completed' ||
        data1 === 'access_pending'
      )) {
        const err7 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/enum',
          keyword: 'enum',
          params: { allowedValues: schema1479.properties.status.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.targetEpoch !== undefined) {
      let data2 = data.targetEpoch;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err8 = {
          instancePath: instancePath + '/targetEpoch',
          schemaPath: '#/properties/targetEpoch/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.onlineEpoch !== undefined) {
      let data3 = data.onlineEpoch;
      if (
        !(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3)) &&
        data3 !== null
      ) {
        const err9 = {
          instancePath: instancePath + '/onlineEpoch',
          schemaPath: '#/properties/onlineEpoch/type',
          keyword: 'type',
          params: { type: schema1479.properties.onlineEpoch.type },
          message: 'must be integer,null',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.primaryHost !== undefined) {
      let data4 = data.primaryHost;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err10 = {
          instancePath: instancePath + '/primaryHost',
          schemaPath: '#/properties/primaryHost/type',
          keyword: 'type',
          params: { type: schema1479.properties.primaryHost.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data5 = data.spaces;
      if (Array.isArray(data5)) {
        const len0 = data5.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data6 = data5[i0];
          if (data6 && typeof data6 == 'object' && !Array.isArray(data6)) {
            if (data6.spaceId !== undefined) {
              let data7 = data6.spaceId;
              if (typeof data7 === 'string') {
                if (!formats0.test(data7)) {
                  const err11 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/OnlineSpace/properties/spaceId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err11];
                  } else {
                    vErrors.push(err11);
                  }
                  errors++;
                }
              } else {
                const err12 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/spaceId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data6.slug !== undefined) {
              if (typeof data6.slug !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/slug/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
            }
            if (data6.releaseId !== undefined) {
              let data9 = data6.releaseId;
              if (typeof data9 !== 'string' && data9 !== null) {
                const err14 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/releaseId',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/releaseId/type',
                  keyword: 'type',
                  params: { type: schema1480.properties.releaseId.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
              if (typeof data9 === 'string') {
                if (!formats0.test(data9)) {
                  const err15 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/releaseId',
                    schemaPath:
                      '#/components/schemas/OnlineSpace/properties/releaseId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err15];
                  } else {
                    vErrors.push(err15);
                  }
                  errors++;
                }
              }
            }
            if (data6.readerHref !== undefined) {
              let data10 = data6.readerHref;
              if (typeof data10 !== 'string' && data10 !== null) {
                const err16 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/readerHref',
                  schemaPath:
                    '#/components/schemas/OnlineSpace/properties/readerHref/type',
                  keyword: 'type',
                  params: { type: schema1480.properties.readerHref.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
            }
          } else {
            const err17 = {
              instancePath: instancePath + '/spaces/' + i0,
              schemaPath: '#/components/schemas/OnlineSpace/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.error !== undefined) {
      let data11 = data.error;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err19 = {
          instancePath: instancePath + '/error',
          schemaPath: '#/properties/error/type',
          keyword: 'type',
          params: { type: schema1479.properties.error.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.canRetry !== undefined) {
      if (typeof data.canRetry !== 'boolean') {
        const err20 = {
          instancePath: instancePath + '/canRetry',
          schemaPath: '#/properties/canRetry/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.searchStatus !== undefined) {
      let data13 = data.searchStatus;
      if (typeof data13 !== 'string' && data13 !== null) {
        const err21 = {
          instancePath: instancePath + '/searchStatus',
          schemaPath: '#/properties/searchStatus/type',
          keyword: 'type',
          params: { type: schema1479.properties.searchStatus.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.desired !== undefined) {
      let data14 = data.desired;
      const _errs31 = errors;
      let valid5 = false;
      const _errs32 = errors;
      if (
        !validate1323(data14, {
          instancePath: instancePath + '/desired',
          parentData: data,
          parentDataProperty: 'desired',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1323.errors
            : vErrors.concat(validate1323.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs32 === errors;
      valid5 = valid5 || _valid0;
      if (_valid0) {
        var props0 = {};
        props0.epoch = true;
        props0.spaces = true;
      }
      const _errs33 = errors;
      if (data14 !== null) {
        const err22 = {
          instancePath: instancePath + '/desired',
          schemaPath: '#/properties/desired/anyOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
      var _valid0 = _errs33 === errors;
      valid5 = valid5 || _valid0;
      if (!valid5) {
        const err23 = {
          instancePath: instancePath + '/desired',
          schemaPath: '#/properties/desired/anyOf',
          keyword: 'anyOf',
          params: {},
          message: 'must match a schema in anyOf',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      } else {
        errors = _errs31;
        if (vErrors !== null) {
          if (_errs31) {
            vErrors.length = _errs31;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.current !== undefined) {
      let data15 = data.current;
      const _errs36 = errors;
      let valid6 = false;
      const _errs37 = errors;
      if (
        !validate1325(data15, {
          instancePath: instancePath + '/current',
          parentData: data,
          parentDataProperty: 'current',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1325.errors
            : vErrors.concat(validate1325.errors);
        errors = vErrors.length;
      }
      var _valid1 = _errs37 === errors;
      valid6 = valid6 || _valid1;
      if (_valid1) {
        var props1 = {};
        props1.epoch = true;
        props1.primaryHost = true;
        props1.readerHref = true;
        props1.spaces = true;
        props1.readable = true;
        props1.searchStatus = true;
      }
      const _errs38 = errors;
      if (data15 !== null) {
        const err24 = {
          instancePath: instancePath + '/current',
          schemaPath: '#/properties/current/anyOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
      var _valid1 = _errs38 === errors;
      valid6 = valid6 || _valid1;
      if (!valid6) {
        const err25 = {
          instancePath: instancePath + '/current',
          schemaPath: '#/properties/current/anyOf',
          keyword: 'anyOf',
          params: {},
          message: 'must match a schema in anyOf',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      } else {
        errors = _errs36;
        if (vErrors !== null) {
          if (_errs36) {
            vErrors.length = _errs36;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.terminal !== undefined) {
      if (typeof data.terminal !== 'boolean') {
        const err26 = {
          instancePath: instancePath + '/terminal',
          schemaPath: '#/properties/terminal/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.successful !== undefined) {
      if (typeof data.successful !== 'boolean') {
        const err27 = {
          instancePath: instancePath + '/successful',
          schemaPath: '#/properties/successful/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.nextPollAfterSeconds !== undefined) {
      let data18 = data.nextPollAfterSeconds;
      if (!(typeof data18 == 'number' && !(data18 % 1) && !isNaN(data18))) {
        const err28 = {
          instancePath: instancePath + '/nextPollAfterSeconds',
          schemaPath: '#/properties/nextPollAfterSeconds/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
    }
  } else {
    const err29 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err29];
    } else {
      vErrors.push(err29);
    }
    errors++;
  }
  validate1333.errors = vErrors;
  return errors === 0;
}
validate1333.evaluated = {
  props: {
    enabled: true,
    status: true,
    targetEpoch: true,
    onlineEpoch: true,
    primaryHost: true,
    spaces: true,
    error: true,
    canRetry: true,
    searchStatus: true,
    desired: true,
    current: true,
    terminal: true,
    successful: true,
    nextPollAfterSeconds: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1332(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/siteDeliveryStatusOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1332.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1333(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1333.errors
        : vErrors.concat(validate1333.errors);
    errors = vErrors.length;
  }
  validate1332.errors = vErrors;
  return errors === 0;
}
validate1332.evaluated = {
  props: {
    enabled: true,
    status: true,
    targetEpoch: true,
    onlineEpoch: true,
    primaryHost: true,
    spaces: true,
    error: true,
    canRetry: true,
    searchStatus: true,
    desired: true,
    current: true,
    terminal: true,
    successful: true,
    nextPollAfterSeconds: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
