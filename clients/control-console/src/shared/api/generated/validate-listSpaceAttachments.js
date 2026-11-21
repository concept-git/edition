// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listSpaceAttachmentsInput = validate1259;
const schema1419 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'spaceId'],
    },
    query: {
      type: 'object',
      properties: {
        cursor: { type: 'string', maxLength: 2048, minLength: 0 },
        limit: {
          type: 'integer',
          format: 'int32',
          default: 30,
          maximum: 100,
          minimum: 1,
        },
        q: { type: 'string', default: '', maxLength: 200, minLength: 0 },
        type: { type: 'string', default: 'all', pattern: 'all|image|pdf' },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/listSpaceAttachmentsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern118 = new RegExp('all|image|pdf', 'u');
function validate1259(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSpaceAttachmentsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1259.evaluated;
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
        if (data0.spaceId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err5 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
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
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
        if (data3.cursor !== undefined) {
          let data4 = data3.cursor;
          if (typeof data4 === 'string') {
            if (func1(data4) > 2048) {
              const err8 = {
                instancePath: instancePath + '/query/cursor',
                schemaPath: '#/properties/query/properties/cursor/maxLength',
                keyword: 'maxLength',
                params: { limit: 2048 },
                message: 'must NOT have more than 2048 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data4) < 0) {
              const err9 = {
                instancePath: instancePath + '/query/cursor',
                schemaPath: '#/properties/query/properties/cursor/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
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
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data3.limit !== undefined) {
          let data5 = data3.limit;
          if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
            const err11 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
          if (typeof data5 == 'number') {
            if (data5 > 100 || isNaN(data5)) {
              const err12 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (data5 < 1 || isNaN(data5)) {
              const err13 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
          }
        }
        if (data3.q !== undefined) {
          let data6 = data3.q;
          if (typeof data6 === 'string') {
            if (func1(data6) > 200) {
              const err14 = {
                instancePath: instancePath + '/query/q',
                schemaPath: '#/properties/query/properties/q/maxLength',
                keyword: 'maxLength',
                params: { limit: 200 },
                message: 'must NOT have more than 200 characters',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (func1(data6) < 0) {
              const err15 = {
                instancePath: instancePath + '/query/q',
                schemaPath: '#/properties/query/properties/q/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
          } else {
            const err16 = {
              instancePath: instancePath + '/query/q',
              schemaPath: '#/properties/query/properties/q/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
        }
        if (data3.type !== undefined) {
          let data7 = data3.type;
          if (typeof data7 === 'string') {
            if (!pattern118.test(data7)) {
              const err17 = {
                instancePath: instancePath + '/query/type',
                schemaPath: '#/properties/query/properties/type/pattern',
                keyword: 'pattern',
                params: { pattern: 'all|image|pdf' },
                message: 'must match pattern "' + 'all|image|pdf' + '"',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = {
              instancePath: instancePath + '/query/type',
              schemaPath: '#/properties/query/properties/type/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
        }
        if (data3.fields !== undefined) {
          let data8 = data3.fields;
          if (typeof data8 === 'string') {
            if (func1(data8) > 4096) {
              const err19 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
            if (func1(data8) < 1) {
              const err20 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err20];
              } else {
                vErrors.push(err20);
              }
              errors++;
            }
          } else {
            const err21 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err21];
            } else {
              vErrors.push(err21);
            }
            errors++;
          }
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
  } else {
    const err23 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err23];
    } else {
      vErrors.push(err23);
    }
    errors++;
  }
  validate1259.errors = vErrors;
  return errors === 0;
}
validate1259.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listSpaceAttachmentsOutput = validate1260;
const schema1420 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/AttachmentPageResponse',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialAttachmentPageResponse',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listSpaceAttachmentsOutput',
};
const schema1421 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/SpaceAttachmentResponse' },
    },
    nextCursor: { type: ['string', 'null'] },
  },
};
const schema1422 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    pageId: { type: 'string', format: 'uuid' },
    pageTitle: { type: 'string' },
    filename: { type: 'string' },
    mime: { type: 'string' },
    sizeBytes: { type: 'integer', format: 'int64' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
const formats10 = fullFormats['date-time'];
function validate1261(
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
  const evaluated0 = validate1261.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/SpaceAttachmentResponse/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err0];
                  } else {
                    vErrors.push(err0);
                  }
                  errors++;
                }
              } else {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/id/type',
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
            }
            if (data1.pageId !== undefined) {
              let data3 = data1.pageId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath: instancePath + '/items/' + i0 + '/pageId',
                    schemaPath:
                      '#/components/schemas/SpaceAttachmentResponse/properties/pageId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err2];
                  } else {
                    vErrors.push(err2);
                  }
                  errors++;
                }
              } else {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/pageId',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/pageId/type',
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
            if (data1.pageTitle !== undefined) {
              if (typeof data1.pageTitle !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/pageTitle',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/pageTitle/type',
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
            if (data1.filename !== undefined) {
              if (typeof data1.filename !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/filename',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/filename/type',
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
            if (data1.mime !== undefined) {
              if (typeof data1.mime !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/mime',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/mime/type',
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
            if (data1.sizeBytes !== undefined) {
              let data7 = data1.sizeBytes;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/sizeBytes',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/sizeBytes/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data8 = data1.createdAt;
              if (typeof data8 === 'string') {
                if (!formats10.validate(data8)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/SpaceAttachmentResponse/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
              } else {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/createdAt/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/SpaceAttachmentResponse/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data9 = data.nextCursor;
      if (typeof data9 !== 'string' && data9 !== null) {
        const err12 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema1421.properties.nextCursor.type },
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
  validate1261.errors = vErrors;
  return errors === 0;
}
validate1261.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1423 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialSpaceAttachmentResponse' },
    },
    nextCursor: { type: ['string', 'null'] },
  },
};
const schema1424 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    pageId: { type: 'string', format: 'uuid' },
    pageTitle: { type: 'string' },
    filename: { type: 'string' },
    mime: { type: 'string' },
    sizeBytes: { type: 'integer', format: 'int64' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
function validate1263(
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
  const evaluated0 = validate1263.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialSpaceAttachmentResponse/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err0];
                  } else {
                    vErrors.push(err0);
                  }
                  errors++;
                }
              } else {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialSpaceAttachmentResponse/properties/id/type',
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
            }
            if (data1.pageId !== undefined) {
              let data3 = data1.pageId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath: instancePath + '/items/' + i0 + '/pageId',
                    schemaPath:
                      '#/components/schemas/PartialSpaceAttachmentResponse/properties/pageId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err2];
                  } else {
                    vErrors.push(err2);
                  }
                  errors++;
                }
              } else {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/pageId',
                  schemaPath:
                    '#/components/schemas/PartialSpaceAttachmentResponse/properties/pageId/type',
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
            if (data1.pageTitle !== undefined) {
              if (typeof data1.pageTitle !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/pageTitle',
                  schemaPath:
                    '#/components/schemas/PartialSpaceAttachmentResponse/properties/pageTitle/type',
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
            if (data1.filename !== undefined) {
              if (typeof data1.filename !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/filename',
                  schemaPath:
                    '#/components/schemas/PartialSpaceAttachmentResponse/properties/filename/type',
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
            if (data1.mime !== undefined) {
              if (typeof data1.mime !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/mime',
                  schemaPath:
                    '#/components/schemas/PartialSpaceAttachmentResponse/properties/mime/type',
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
            if (data1.sizeBytes !== undefined) {
              let data7 = data1.sizeBytes;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/sizeBytes',
                  schemaPath:
                    '#/components/schemas/PartialSpaceAttachmentResponse/properties/sizeBytes/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data8 = data1.createdAt;
              if (typeof data8 === 'string') {
                if (!formats10.validate(data8)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialSpaceAttachmentResponse/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
              } else {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialSpaceAttachmentResponse/properties/createdAt/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath:
                '#/components/schemas/PartialSpaceAttachmentResponse/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data9 = data.nextCursor;
      if (typeof data9 !== 'string' && data9 !== null) {
        const err12 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema1423.properties.nextCursor.type },
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
  validate1263.errors = vErrors;
  return errors === 0;
}
validate1263.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1260(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSpaceAttachmentsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1260.evaluated;
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
    !validate1261(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1261.errors
        : vErrors.concat(validate1261.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.nextCursor = true;
  }
  const _errs2 = errors;
  if (
    !validate1263(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1263.errors
        : vErrors.concat(validate1263.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.items = true;
      props0.nextCursor = true;
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
  validate1260.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1260.evaluated = { dynamicProps: true, dynamicItems: false };
export const listSpaceAttachmentsOutputFull = validate1265;
const schema1425 = {
  $ref: 'https://edition.invalid/control#/components/schemas/AttachmentPageResponse',
  $id: 'https://edition.invalid/validators/listSpaceAttachmentsOutputFull',
};
function validate1266(
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
  const evaluated0 = validate1266.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/items/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/SpaceAttachmentResponse/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err0];
                  } else {
                    vErrors.push(err0);
                  }
                  errors++;
                }
              } else {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/id/type',
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
            }
            if (data1.pageId !== undefined) {
              let data3 = data1.pageId;
              if (typeof data3 === 'string') {
                if (!formats0.test(data3)) {
                  const err2 = {
                    instancePath: instancePath + '/items/' + i0 + '/pageId',
                    schemaPath:
                      '#/components/schemas/SpaceAttachmentResponse/properties/pageId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err2];
                  } else {
                    vErrors.push(err2);
                  }
                  errors++;
                }
              } else {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/pageId',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/pageId/type',
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
            if (data1.pageTitle !== undefined) {
              if (typeof data1.pageTitle !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/pageTitle',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/pageTitle/type',
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
            if (data1.filename !== undefined) {
              if (typeof data1.filename !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/filename',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/filename/type',
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
            if (data1.mime !== undefined) {
              if (typeof data1.mime !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/mime',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/mime/type',
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
            if (data1.sizeBytes !== undefined) {
              let data7 = data1.sizeBytes;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/sizeBytes',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/sizeBytes/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data8 = data1.createdAt;
              if (typeof data8 === 'string') {
                if (!formats10.validate(data8)) {
                  const err8 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/SpaceAttachmentResponse/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
              } else {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/SpaceAttachmentResponse/properties/createdAt/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/SpaceAttachmentResponse/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      let data9 = data.nextCursor;
      if (typeof data9 !== 'string' && data9 !== null) {
        const err12 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: schema1421.properties.nextCursor.type },
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
  validate1266.errors = vErrors;
  return errors === 0;
}
validate1266.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1265(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSpaceAttachmentsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1265.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1266(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1266.errors
        : vErrors.concat(validate1266.errors);
    errors = vErrors.length;
  }
  validate1265.errors = vErrors;
  return errors === 0;
}
validate1265.evaluated = {
  props: { items: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
