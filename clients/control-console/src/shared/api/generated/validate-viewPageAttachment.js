// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const viewPageAttachmentInput = validate1210;
const schema1359 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
        pageId: { type: 'string', format: 'uuid' },
        ref: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'spaceId', 'pageId', 'ref'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/viewPageAttachmentInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1210(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPageAttachmentInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1210.evaluated;
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
        if (data0.ref === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'ref' },
            message: "must have required property '" + 'ref' + "'",
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
        if (data0.ref !== undefined) {
          let data4 = data0.ref;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err11 = {
                instancePath: instancePath + '/path/ref',
                schemaPath: '#/properties/path/properties/ref/format',
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
              instancePath: instancePath + '/path/ref',
              schemaPath: '#/properties/path/properties/ref/type',
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
  validate1210.errors = vErrors;
  return errors === 0;
}
validate1210.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const viewPageAttachmentOutput = validate1211;
const schema1360 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/AttachmentLink',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialAttachmentLink',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/viewPageAttachmentOutput',
};
const schema1361 = {
  type: 'object',
  description: '实时鉴权代理地址；expiresAt为空；不进 PageDetail',
  properties: {
    url: { type: 'string' },
    expiresAt: { type: ['string', 'null'], format: 'date-time' },
    filename: { type: 'string' },
    mime: { type: 'string' },
    sizeBytes: { type: 'integer', format: 'int64' },
  },
};
const schema1362 = {
  type: 'object',
  description: '实时鉴权代理地址；expiresAt为空；不进 PageDetail',
  properties: {
    url: { type: 'string' },
    expiresAt: { type: ['string', 'null'], format: 'date-time' },
    filename: { type: 'string' },
    mime: { type: 'string' },
    sizeBytes: { type: 'integer', format: 'int64' },
  },
};
const formats10 = fullFormats['date-time'];
function validate1211(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPageAttachmentOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1211.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.url !== undefined) {
      if (typeof data.url !== 'string') {
        const err0 = {
          instancePath: instancePath + '/url',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/url/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.expiresAt !== undefined) {
      let data1 = data.expiresAt;
      if (typeof data1 !== 'string' && data1 !== null) {
        const err1 = {
          instancePath: instancePath + '/expiresAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/expiresAt/type',
          keyword: 'type',
          params: { type: schema1361.properties.expiresAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      if (typeof data1 === 'string') {
        if (!formats10.validate(data1)) {
          const err2 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      }
    }
    if (data.filename !== undefined) {
      if (typeof data.filename !== 'string') {
        const err3 = {
          instancePath: instancePath + '/filename',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/filename/type',
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
    if (data.mime !== undefined) {
      if (typeof data.mime !== 'string') {
        const err4 = {
          instancePath: instancePath + '/mime',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/mime/type',
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
    if (data.sizeBytes !== undefined) {
      let data4 = data.sizeBytes;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
        const err5 = {
          instancePath: instancePath + '/sizeBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/sizeBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/AttachmentLink/type',
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
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.url = true;
    props0.expiresAt = true;
    props0.filename = true;
    props0.mime = true;
    props0.sizeBytes = true;
  }
  const _errs14 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.url !== undefined) {
      if (typeof data.url !== 'string') {
        const err7 = {
          instancePath: instancePath + '/url',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialAttachmentLink/properties/url/type',
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
    if (data.expiresAt !== undefined) {
      let data6 = data.expiresAt;
      if (typeof data6 !== 'string' && data6 !== null) {
        const err8 = {
          instancePath: instancePath + '/expiresAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialAttachmentLink/properties/expiresAt/type',
          keyword: 'type',
          params: { type: schema1362.properties.expiresAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err9 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialAttachmentLink/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      }
    }
    if (data.filename !== undefined) {
      if (typeof data.filename !== 'string') {
        const err10 = {
          instancePath: instancePath + '/filename',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialAttachmentLink/properties/filename/type',
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
    if (data.mime !== undefined) {
      if (typeof data.mime !== 'string') {
        const err11 = {
          instancePath: instancePath + '/mime',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialAttachmentLink/properties/mime/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.sizeBytes !== undefined) {
      let data9 = data.sizeBytes;
      if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9))) {
        const err12 = {
          instancePath: instancePath + '/sizeBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialAttachmentLink/properties/sizeBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
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
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PartialAttachmentLink/type',
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
  var _valid0 = _errs14 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.url = true;
      props0.expiresAt = true;
      props0.filename = true;
      props0.mime = true;
      props0.sizeBytes = true;
    }
  }
  if (!valid0) {
    const err14 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
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
  validate1211.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1211.evaluated = { dynamicProps: true, dynamicItems: false };
export const viewPageAttachmentOutputFull = validate1212;
const schema1363 = {
  $ref: 'https://edition.invalid/control#/components/schemas/AttachmentLink',
  $id: 'https://edition.invalid/validators/viewPageAttachmentOutputFull',
};
function validate1212(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPageAttachmentOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1212.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.url !== undefined) {
      if (typeof data.url !== 'string') {
        const err0 = {
          instancePath: instancePath + '/url',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/url/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.expiresAt !== undefined) {
      let data1 = data.expiresAt;
      if (typeof data1 !== 'string' && data1 !== null) {
        const err1 = {
          instancePath: instancePath + '/expiresAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/expiresAt/type',
          keyword: 'type',
          params: { type: schema1361.properties.expiresAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      if (typeof data1 === 'string') {
        if (!formats10.validate(data1)) {
          const err2 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      }
    }
    if (data.filename !== undefined) {
      if (typeof data.filename !== 'string') {
        const err3 = {
          instancePath: instancePath + '/filename',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/filename/type',
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
    if (data.mime !== undefined) {
      if (typeof data.mime !== 'string') {
        const err4 = {
          instancePath: instancePath + '/mime',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/mime/type',
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
    if (data.sizeBytes !== undefined) {
      let data4 = data.sizeBytes;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
        const err5 = {
          instancePath: instancePath + '/sizeBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/AttachmentLink/properties/sizeBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/AttachmentLink/type',
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
  validate1212.errors = vErrors;
  return errors === 0;
}
validate1212.evaluated = {
  props: {
    url: true,
    expiresAt: true,
    filename: true,
    mime: true,
    sizeBytes: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
