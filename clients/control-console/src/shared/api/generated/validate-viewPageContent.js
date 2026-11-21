// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const viewPageContentInput = validate93;
const schema117 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
        pageId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'spaceId', 'pageId'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/viewPageContentInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate93(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPageContentInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate93.evaluated;
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
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err4 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
          } else {
            const err5 = {
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err6 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
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
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
        if (data0.pageId !== undefined) {
          let data3 = data0.pageId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err8 = {
                instancePath: instancePath + '/path/pageId',
                schemaPath: '#/properties/path/properties/pageId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/pageId',
              schemaPath: '#/properties/path/properties/pageId/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.query !== undefined) {
      let data4 = data.query;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.fields !== undefined) {
          let data5 = data4.fields;
          if (typeof data5 === 'string') {
            if (func1(data5) > 4096) {
              const err11 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (func1(data5) < 1) {
              const err12 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
          } else {
            const err13 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err14 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath: '#/type',
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
  validate93.errors = vErrors;
  return errors === 0;
}
validate93.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const viewPageContentOutput = validate94;
const schema118 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/ContentSnapshot',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialContentSnapshot',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/viewPageContentOutput',
};
const schema119 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    format: { type: 'string' },
    content: { type: 'string' },
    revision: { type: 'integer', format: 'int32' },
    contentType: { type: 'string' },
    versionRef: { type: ['string', 'null'] },
    interpretation: { type: 'object', additionalProperties: {} },
  },
  required: [
    'content',
    'contentType',
    'format',
    'id',
    'interpretation',
    'revision',
    'versionRef',
  ],
};
const schema120 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    format: { type: 'string' },
    content: { type: 'string' },
    revision: { type: 'integer', format: 'int32' },
    contentType: { type: 'string' },
    versionRef: { type: ['string', 'null'] },
    interpretation: { type: 'object', additionalProperties: {} },
  },
};
function validate94(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPageContentOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate94.evaluated;
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
    if (data.content === undefined) {
      const err0 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'content' },
        message: "must have required property '" + 'content' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.contentType === undefined) {
      const err1 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'contentType' },
        message: "must have required property '" + 'contentType' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.format === undefined) {
      const err2 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'format' },
        message: "must have required property '" + 'format' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err3 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.interpretation === undefined) {
      const err4 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'interpretation' },
        message: "must have required property '" + 'interpretation' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.revision === undefined) {
      const err5 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'revision' },
        message: "must have required property '" + 'revision' + "'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.versionRef === undefined) {
      const err6 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'versionRef' },
        message: "must have required property '" + 'versionRef' + "'",
      };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err7 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/id/type',
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
    if (data.format !== undefined) {
      if (typeof data.format !== 'string') {
        const err9 = {
          instancePath: instancePath + '/format',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/format/type',
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
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err10 = {
          instancePath: instancePath + '/content',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/content/type',
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
    if (data.revision !== undefined) {
      let data3 = data.revision;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err11 = {
          instancePath: instancePath + '/revision',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/revision/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err12 = {
          instancePath: instancePath + '/contentType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      let data5 = data.versionRef;
      if (typeof data5 !== 'string' && data5 !== null) {
        const err13 = {
          instancePath: instancePath + '/versionRef',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/versionRef/type',
          keyword: 'type',
          params: { type: schema119.properties.versionRef.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.interpretation !== undefined) {
      let data6 = data.interpretation;
      if (data6 && typeof data6 == 'object' && !Array.isArray(data6)) {
      } else {
        const err14 = {
          instancePath: instancePath + '/interpretation',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/interpretation/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/ContentSnapshot/type',
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
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.id = true;
    props0.format = true;
    props0.content = true;
    props0.revision = true;
    props0.contentType = true;
    props0.versionRef = true;
    props0.interpretation = true;
  }
  const _errs19 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data7 = data.id;
      if (typeof data7 === 'string') {
        if (!formats0.test(data7)) {
          const err16 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialContentSnapshot/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/id',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialContentSnapshot/properties/id/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.format !== undefined) {
      if (typeof data.format !== 'string') {
        const err18 = {
          instancePath: instancePath + '/format',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialContentSnapshot/properties/format/type',
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
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err19 = {
          instancePath: instancePath + '/content',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialContentSnapshot/properties/content/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.revision !== undefined) {
      let data10 = data.revision;
      if (!(typeof data10 == 'number' && !(data10 % 1) && !isNaN(data10))) {
        const err20 = {
          instancePath: instancePath + '/revision',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialContentSnapshot/properties/revision/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err21 = {
          instancePath: instancePath + '/contentType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialContentSnapshot/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      let data12 = data.versionRef;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err22 = {
          instancePath: instancePath + '/versionRef',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialContentSnapshot/properties/versionRef/type',
          keyword: 'type',
          params: { type: schema120.properties.versionRef.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.interpretation !== undefined) {
      let data13 = data.interpretation;
      if (data13 && typeof data13 == 'object' && !Array.isArray(data13)) {
      } else {
        const err23 = {
          instancePath: instancePath + '/interpretation',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialContentSnapshot/properties/interpretation/type',
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
    }
  } else {
    const err24 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PartialContentSnapshot/type',
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
  var _valid0 = _errs19 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.id = true;
      props0.format = true;
      props0.content = true;
      props0.revision = true;
      props0.contentType = true;
      props0.versionRef = true;
      props0.interpretation = true;
    }
  }
  if (!valid0) {
    const err25 = {
      instancePath,
      schemaPath: '#/anyOf',
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
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate94.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate94.evaluated = { dynamicProps: true, dynamicItems: false };
export const viewPageContentOutputFull = validate95;
const schema121 = {
  $ref: 'https://edition.invalid/control#/components/schemas/ContentSnapshot',
  $id: 'https://edition.invalid/validators/viewPageContentOutputFull',
};
function validate95(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPageContentOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate95.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.content === undefined) {
      const err0 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'content' },
        message: "must have required property '" + 'content' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.contentType === undefined) {
      const err1 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'contentType' },
        message: "must have required property '" + 'contentType' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.format === undefined) {
      const err2 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'format' },
        message: "must have required property '" + 'format' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err3 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.interpretation === undefined) {
      const err4 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'interpretation' },
        message: "must have required property '" + 'interpretation' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.revision === undefined) {
      const err5 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'revision' },
        message: "must have required property '" + 'revision' + "'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.versionRef === undefined) {
      const err6 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/ContentSnapshot/required',
        keyword: 'required',
        params: { missingProperty: 'versionRef' },
        message: "must have required property '" + 'versionRef' + "'",
      };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err7 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/id/type',
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
    if (data.format !== undefined) {
      if (typeof data.format !== 'string') {
        const err9 = {
          instancePath: instancePath + '/format',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/format/type',
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
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err10 = {
          instancePath: instancePath + '/content',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/content/type',
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
    if (data.revision !== undefined) {
      let data3 = data.revision;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err11 = {
          instancePath: instancePath + '/revision',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/revision/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err12 = {
          instancePath: instancePath + '/contentType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      let data5 = data.versionRef;
      if (typeof data5 !== 'string' && data5 !== null) {
        const err13 = {
          instancePath: instancePath + '/versionRef',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/versionRef/type',
          keyword: 'type',
          params: { type: schema119.properties.versionRef.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.interpretation !== undefined) {
      let data6 = data.interpretation;
      if (data6 && typeof data6 == 'object' && !Array.isArray(data6)) {
      } else {
        const err14 = {
          instancePath: instancePath + '/interpretation',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ContentSnapshot/properties/interpretation/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/ContentSnapshot/type',
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
  validate95.errors = vErrors;
  return errors === 0;
}
validate95.evaluated = {
  props: {
    id: true,
    format: true,
    content: true,
    revision: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
