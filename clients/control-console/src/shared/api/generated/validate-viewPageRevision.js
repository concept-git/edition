// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const viewPageRevisionInput = validate1167;
const schema1322 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
        pageId: { type: 'string', format: 'uuid' },
        revision: { type: 'integer', format: 'int32', minimum: 1 },
      },
      required: ['tenantId', 'spaceId', 'pageId', 'revision'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/viewPageRevisionInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1167(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPageRevisionInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1167.evaluated;
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
        if (data0.pageId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'pageId' },
            message: "must have required property '" + 'pageId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.revision === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'revision' },
            message: "must have required property '" + 'revision' + "'",
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err7 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
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
          } else {
            const err8 = {
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
        if (data0.pageId !== undefined) {
          let data3 = data0.pageId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err9 = {
                instancePath: instancePath + '/path/pageId',
                schemaPath: '#/properties/path/properties/pageId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/pageId',
              schemaPath: '#/properties/path/properties/pageId/type',
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
        if (data0.revision !== undefined) {
          let data4 = data0.revision;
          if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
            const err11 = {
              instancePath: instancePath + '/path/revision',
              schemaPath: '#/properties/path/properties/revision/type',
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
          if (typeof data4 == 'number') {
            if (data4 < 1 || isNaN(data4)) {
              const err12 = {
                instancePath: instancePath + '/path/revision',
                schemaPath: '#/properties/path/properties/revision/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
          }
        }
      } else {
        const err13 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    }
    if (data.query !== undefined) {
      let data5 = data.query;
      if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
        if (data5.fields !== undefined) {
          let data6 = data5.fields;
          if (typeof data6 === 'string') {
            if (func1(data6) > 4096) {
              const err14 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (func1(data6) < 1) {
              const err15 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err17 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err18];
    } else {
      vErrors.push(err18);
    }
    errors++;
  }
  validate1167.errors = vErrors;
  return errors === 0;
}
validate1167.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const viewPageRevisionOutput = validate1168;
const schema1323 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/RevisionDetail',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialRevisionDetail',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/viewPageRevisionOutput',
};
const schema1324 = {
  type: 'object',
  properties: {
    n: { type: 'integer', format: 'int32' },
    actor: { $ref: '#/components/schemas/ActorView' },
    createdAt: { type: 'string', format: 'date-time' },
    note: { type: ['string', 'null'] },
    sizeBytes: { type: 'integer', format: 'int64' },
    sizeDelta: { type: 'integer', format: 'int64' },
    content: { type: 'string' },
    contentType: { type: 'string' },
    versionRef: { type: 'string' },
    interpretation: { type: 'object', additionalProperties: {} },
  },
};
const schema1306 = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    id: { type: 'string', format: 'uuid' },
    displayName: { type: 'string' },
    status: { type: 'string' },
  },
};
const formats10 = fullFormats['date-time'];
function validate1169(
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
  const evaluated0 = validate1169.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.n !== undefined) {
      let data0 = data.n;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/n',
          schemaPath: '#/properties/n/type',
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
    if (data.actor !== undefined) {
      let data1 = data.actor;
      if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
        if (data1.type !== undefined) {
          if (typeof data1.type !== 'string') {
            const err1 = {
              instancePath: instancePath + '/actor/type',
              schemaPath: '#/components/schemas/ActorView/properties/type/type',
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
        if (data1.id !== undefined) {
          let data3 = data1.id;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err2 = {
                instancePath: instancePath + '/actor/id',
                schemaPath:
                  '#/components/schemas/ActorView/properties/id/format',
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
              instancePath: instancePath + '/actor/id',
              schemaPath: '#/components/schemas/ActorView/properties/id/type',
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
        if (data1.displayName !== undefined) {
          if (typeof data1.displayName !== 'string') {
            const err4 = {
              instancePath: instancePath + '/actor/displayName',
              schemaPath:
                '#/components/schemas/ActorView/properties/displayName/type',
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
        if (data1.status !== undefined) {
          if (typeof data1.status !== 'string') {
            const err5 = {
              instancePath: instancePath + '/actor/status',
              schemaPath:
                '#/components/schemas/ActorView/properties/status/type',
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
      } else {
        const err6 = {
          instancePath: instancePath + '/actor',
          schemaPath: '#/components/schemas/ActorView/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data6 = data.createdAt;
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err7 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.note !== undefined) {
      let data7 = data.note;
      if (typeof data7 !== 'string' && data7 !== null) {
        const err9 = {
          instancePath: instancePath + '/note',
          schemaPath: '#/properties/note/type',
          keyword: 'type',
          params: { type: schema1324.properties.note.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.sizeBytes !== undefined) {
      let data8 = data.sizeBytes;
      if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
        const err10 = {
          instancePath: instancePath + '/sizeBytes',
          schemaPath: '#/properties/sizeBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.sizeDelta !== undefined) {
      let data9 = data.sizeDelta;
      if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9))) {
        const err11 = {
          instancePath: instancePath + '/sizeDelta',
          schemaPath: '#/properties/sizeDelta/type',
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
    }
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err12 = {
          instancePath: instancePath + '/content',
          schemaPath: '#/properties/content/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err13 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      if (typeof data.versionRef !== 'string') {
        const err14 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.interpretation !== undefined) {
      let data13 = data.interpretation;
      if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
      } else {
        const err15 = {
          instancePath: instancePath + '/interpretation',
          schemaPath: '#/properties/interpretation/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate1169.errors = vErrors;
  return errors === 0;
}
validate1169.evaluated = {
  props: {
    n: true,
    actor: true,
    createdAt: true,
    note: true,
    sizeBytes: true,
    sizeDelta: true,
    content: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1326 = {
  type: 'object',
  properties: {
    n: { type: 'integer', format: 'int32' },
    actor: { $ref: '#/components/schemas/PartialActorView' },
    createdAt: { type: 'string', format: 'date-time' },
    note: { type: ['string', 'null'] },
    sizeBytes: { type: 'integer', format: 'int64' },
    sizeDelta: { type: 'integer', format: 'int64' },
    content: { type: 'string' },
    contentType: { type: 'string' },
    versionRef: { type: 'string' },
    interpretation: { type: 'object', additionalProperties: {} },
  },
};
const schema1309 = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    id: { type: 'string', format: 'uuid' },
    displayName: { type: 'string' },
    status: { type: 'string' },
  },
};
function validate1171(
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
  const evaluated0 = validate1171.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.n !== undefined) {
      let data0 = data.n;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/n',
          schemaPath: '#/properties/n/type',
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
    if (data.actor !== undefined) {
      let data1 = data.actor;
      if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
        if (data1.type !== undefined) {
          if (typeof data1.type !== 'string') {
            const err1 = {
              instancePath: instancePath + '/actor/type',
              schemaPath:
                '#/components/schemas/PartialActorView/properties/type/type',
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
        if (data1.id !== undefined) {
          let data3 = data1.id;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err2 = {
                instancePath: instancePath + '/actor/id',
                schemaPath:
                  '#/components/schemas/PartialActorView/properties/id/format',
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
              instancePath: instancePath + '/actor/id',
              schemaPath:
                '#/components/schemas/PartialActorView/properties/id/type',
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
        if (data1.displayName !== undefined) {
          if (typeof data1.displayName !== 'string') {
            const err4 = {
              instancePath: instancePath + '/actor/displayName',
              schemaPath:
                '#/components/schemas/PartialActorView/properties/displayName/type',
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
        if (data1.status !== undefined) {
          if (typeof data1.status !== 'string') {
            const err5 = {
              instancePath: instancePath + '/actor/status',
              schemaPath:
                '#/components/schemas/PartialActorView/properties/status/type',
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
      } else {
        const err6 = {
          instancePath: instancePath + '/actor',
          schemaPath: '#/components/schemas/PartialActorView/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data6 = data.createdAt;
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err7 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.note !== undefined) {
      let data7 = data.note;
      if (typeof data7 !== 'string' && data7 !== null) {
        const err9 = {
          instancePath: instancePath + '/note',
          schemaPath: '#/properties/note/type',
          keyword: 'type',
          params: { type: schema1326.properties.note.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.sizeBytes !== undefined) {
      let data8 = data.sizeBytes;
      if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
        const err10 = {
          instancePath: instancePath + '/sizeBytes',
          schemaPath: '#/properties/sizeBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.sizeDelta !== undefined) {
      let data9 = data.sizeDelta;
      if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9))) {
        const err11 = {
          instancePath: instancePath + '/sizeDelta',
          schemaPath: '#/properties/sizeDelta/type',
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
    }
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err12 = {
          instancePath: instancePath + '/content',
          schemaPath: '#/properties/content/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err13 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      if (typeof data.versionRef !== 'string') {
        const err14 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.interpretation !== undefined) {
      let data13 = data.interpretation;
      if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
      } else {
        const err15 = {
          instancePath: instancePath + '/interpretation',
          schemaPath: '#/properties/interpretation/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate1171.errors = vErrors;
  return errors === 0;
}
validate1171.evaluated = {
  props: {
    n: true,
    actor: true,
    createdAt: true,
    note: true,
    sizeBytes: true,
    sizeDelta: true,
    content: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1168(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPageRevisionOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1168.evaluated;
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
    !validate1169(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1169.errors
        : vErrors.concat(validate1169.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.n = true;
    props0.actor = true;
    props0.createdAt = true;
    props0.note = true;
    props0.sizeBytes = true;
    props0.sizeDelta = true;
    props0.content = true;
    props0.contentType = true;
    props0.versionRef = true;
    props0.interpretation = true;
  }
  const _errs2 = errors;
  if (
    !validate1171(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1171.errors
        : vErrors.concat(validate1171.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.n = true;
      props0.actor = true;
      props0.createdAt = true;
      props0.note = true;
      props0.sizeBytes = true;
      props0.sizeDelta = true;
      props0.content = true;
      props0.contentType = true;
      props0.versionRef = true;
      props0.interpretation = true;
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
  validate1168.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1168.evaluated = { dynamicProps: true, dynamicItems: false };
export const viewPageRevisionOutputFull = validate1173;
const schema1328 = {
  $ref: 'https://edition.invalid/control#/components/schemas/RevisionDetail',
  $id: 'https://edition.invalid/validators/viewPageRevisionOutputFull',
};
function validate1174(
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
  const evaluated0 = validate1174.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.n !== undefined) {
      let data0 = data.n;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/n',
          schemaPath: '#/properties/n/type',
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
    if (data.actor !== undefined) {
      let data1 = data.actor;
      if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
        if (data1.type !== undefined) {
          if (typeof data1.type !== 'string') {
            const err1 = {
              instancePath: instancePath + '/actor/type',
              schemaPath: '#/components/schemas/ActorView/properties/type/type',
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
        if (data1.id !== undefined) {
          let data3 = data1.id;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err2 = {
                instancePath: instancePath + '/actor/id',
                schemaPath:
                  '#/components/schemas/ActorView/properties/id/format',
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
              instancePath: instancePath + '/actor/id',
              schemaPath: '#/components/schemas/ActorView/properties/id/type',
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
        if (data1.displayName !== undefined) {
          if (typeof data1.displayName !== 'string') {
            const err4 = {
              instancePath: instancePath + '/actor/displayName',
              schemaPath:
                '#/components/schemas/ActorView/properties/displayName/type',
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
        if (data1.status !== undefined) {
          if (typeof data1.status !== 'string') {
            const err5 = {
              instancePath: instancePath + '/actor/status',
              schemaPath:
                '#/components/schemas/ActorView/properties/status/type',
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
      } else {
        const err6 = {
          instancePath: instancePath + '/actor',
          schemaPath: '#/components/schemas/ActorView/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data6 = data.createdAt;
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err7 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.note !== undefined) {
      let data7 = data.note;
      if (typeof data7 !== 'string' && data7 !== null) {
        const err9 = {
          instancePath: instancePath + '/note',
          schemaPath: '#/properties/note/type',
          keyword: 'type',
          params: { type: schema1324.properties.note.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.sizeBytes !== undefined) {
      let data8 = data.sizeBytes;
      if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
        const err10 = {
          instancePath: instancePath + '/sizeBytes',
          schemaPath: '#/properties/sizeBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.sizeDelta !== undefined) {
      let data9 = data.sizeDelta;
      if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9))) {
        const err11 = {
          instancePath: instancePath + '/sizeDelta',
          schemaPath: '#/properties/sizeDelta/type',
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
    }
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err12 = {
          instancePath: instancePath + '/content',
          schemaPath: '#/properties/content/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err13 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      if (typeof data.versionRef !== 'string') {
        const err14 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.interpretation !== undefined) {
      let data13 = data.interpretation;
      if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
      } else {
        const err15 = {
          instancePath: instancePath + '/interpretation',
          schemaPath: '#/properties/interpretation/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate1174.errors = vErrors;
  return errors === 0;
}
validate1174.evaluated = {
  props: {
    n: true,
    actor: true,
    createdAt: true,
    note: true,
    sizeBytes: true,
    sizeDelta: true,
    content: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1173(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPageRevisionOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1173.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1174(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1174.errors
        : vErrors.concat(validate1174.errors);
    errors = vErrors.length;
  }
  validate1173.errors = vErrors;
  return errors === 0;
}
validate1173.evaluated = {
  props: {
    n: true,
    actor: true,
    createdAt: true,
    note: true,
    sizeBytes: true,
    sizeDelta: true,
    content: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
