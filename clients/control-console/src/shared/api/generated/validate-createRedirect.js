// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const createRedirectInput = validate590;
const schema696 = {
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
    header: {
      type: 'object',
      properties: {
        'Idempotency-Key': {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
      required: ['Idempotency-Key'],
    },
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/CreateRedirectRequest',
    },
  },
  required: ['path', 'header', 'body'],
  $id: 'https://edition.invalid/validators/createRedirectInput',
};
const schema697 = {
  type: 'object',
  properties: {
    path: { type: 'string', maxLength: 512, minLength: 0 },
    targetType: { type: 'string', minLength: 1, pattern: 'space|page' },
    targetId: { type: 'string', format: 'uuid' },
  },
  required: ['path', 'targetId', 'targetType'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
const pattern80 = new RegExp('space|page', 'u');
function validate590(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createRedirectInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate590.evaluated;
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
    if (data.header === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.body === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.siteId === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
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
        if (data0.siteId !== undefined) {
          let data2 = data0.siteId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err7 = {
                instancePath: instancePath + '/path/siteId',
                schemaPath: '#/properties/path/properties/siteId/format',
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
              instancePath: instancePath + '/path/siteId',
              schemaPath: '#/properties/path/properties/siteId/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.header !== undefined) {
      let data3 = data.header;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3['Idempotency-Key'] === undefined) {
          const err10 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data3['Idempotency-Key'] !== undefined) {
          let data4 = data3['Idempotency-Key'];
          if (typeof data4 === 'string') {
            if (func1(data4) > 128) {
              const err11 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err12 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
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
            if (!pattern4.test(data4)) {
              const err13 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
          } else {
            const err14 = {
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
      } else {
        const err15 = {
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    if (data.body !== undefined) {
      let data5 = data.body;
      if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
        if (data5.path === undefined) {
          const err16 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/required',
            keyword: 'required',
            params: { missingProperty: 'path' },
            message: "must have required property '" + 'path' + "'",
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        if (data5.targetId === undefined) {
          const err17 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/required',
            keyword: 'required',
            params: { missingProperty: 'targetId' },
            message: "must have required property '" + 'targetId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (data5.targetType === undefined) {
          const err18 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/required',
            keyword: 'required',
            params: { missingProperty: 'targetType' },
            message: "must have required property '" + 'targetType' + "'",
          };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        if (data5.path !== undefined) {
          let data6 = data5.path;
          if (typeof data6 === 'string') {
            if (func1(data6) > 512) {
              const err19 = {
                instancePath: instancePath + '/body/path',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/properties/path/maxLength',
                keyword: 'maxLength',
                params: { limit: 512 },
                message: 'must NOT have more than 512 characters',
              };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
            if (func1(data6) < 0) {
              const err20 = {
                instancePath: instancePath + '/body/path',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/properties/path/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
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
              instancePath: instancePath + '/body/path',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/properties/path/type',
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
        if (data5.targetType !== undefined) {
          let data7 = data5.targetType;
          if (typeof data7 === 'string') {
            if (func1(data7) < 1) {
              const err22 = {
                instancePath: instancePath + '/body/targetType',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/properties/targetType/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
            if (!pattern80.test(data7)) {
              const err23 = {
                instancePath: instancePath + '/body/targetType',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/properties/targetType/pattern',
                keyword: 'pattern',
                params: { pattern: 'space|page' },
                message: 'must match pattern "' + 'space|page' + '"',
              };
              if (vErrors === null) {
                vErrors = [err23];
              } else {
                vErrors.push(err23);
              }
              errors++;
            }
          } else {
            const err24 = {
              instancePath: instancePath + '/body/targetType',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/properties/targetType/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err24];
            } else {
              vErrors.push(err24);
            }
            errors++;
          }
        }
        if (data5.targetId !== undefined) {
          let data8 = data5.targetId;
          if (typeof data8 === 'string') {
            if (!formats0.test(data8)) {
              const err25 = {
                instancePath: instancePath + '/body/targetId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/properties/targetId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err25];
              } else {
                vErrors.push(err25);
              }
              errors++;
            }
          } else {
            const err26 = {
              instancePath: instancePath + '/body/targetId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/properties/targetId/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/CreateRedirectRequest/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
  } else {
    const err28 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err28];
    } else {
      vErrors.push(err28);
    }
    errors++;
  }
  validate590.errors = vErrors;
  return errors === 0;
}
validate590.evaluated = {
  props: { path: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const createRedirectOutput = validate591;
const schema698 = {
  $ref: 'https://edition.invalid/control#/components/schemas/RedirectView',
  $id: 'https://edition.invalid/validators/createRedirectOutput',
};
const schema699 = {
  type: 'object',
  properties: {
    path: { type: 'string' },
    targetId: { type: 'string', format: 'uuid' },
    targetType: { type: 'string' },
    origin: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    hitCount: { type: 'integer', format: 'int64' },
    currentPath: { type: 'string' },
    targetLabel: { type: 'string' },
    reachable: { type: 'boolean' },
  },
};
const formats10 = fullFormats['date-time'];
function validate591(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createRedirectOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate591.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.path !== undefined) {
      if (typeof data.path !== 'string') {
        const err0 = {
          instancePath: instancePath + '/path',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/path/type',
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
    if (data.targetId !== undefined) {
      let data1 = data.targetId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err1 = {
            instancePath: instancePath + '/targetId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/RedirectView/properties/targetId/format',
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
          instancePath: instancePath + '/targetId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/targetId/type',
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
    if (data.targetType !== undefined) {
      if (typeof data.targetType !== 'string') {
        const err3 = {
          instancePath: instancePath + '/targetType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/targetType/type',
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
    if (data.origin !== undefined) {
      if (typeof data.origin !== 'string') {
        const err4 = {
          instancePath: instancePath + '/origin',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/origin/type',
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
    if (data.createdAt !== undefined) {
      let data4 = data.createdAt;
      if (typeof data4 === 'string') {
        if (!formats10.validate(data4)) {
          const err5 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/RedirectView/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/createdAt/type',
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
    if (data.hitCount !== undefined) {
      let data5 = data.hitCount;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err7 = {
          instancePath: instancePath + '/hitCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/hitCount/type',
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
    if (data.currentPath !== undefined) {
      if (typeof data.currentPath !== 'string') {
        const err8 = {
          instancePath: instancePath + '/currentPath',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/currentPath/type',
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
    if (data.targetLabel !== undefined) {
      if (typeof data.targetLabel !== 'string') {
        const err9 = {
          instancePath: instancePath + '/targetLabel',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/targetLabel/type',
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
    if (data.reachable !== undefined) {
      if (typeof data.reachable !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/reachable',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/reachable/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/RedirectView/type',
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
  validate591.errors = vErrors;
  return errors === 0;
}
validate591.evaluated = {
  props: {
    path: true,
    targetId: true,
    targetType: true,
    origin: true,
    createdAt: true,
    hitCount: true,
    currentPath: true,
    targetLabel: true,
    reachable: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const createRedirectOutputFull = validate592;
const schema700 = {
  $ref: 'https://edition.invalid/control#/components/schemas/RedirectView',
  $id: 'https://edition.invalid/validators/createRedirectOutputFull',
};
function validate592(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createRedirectOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate592.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.path !== undefined) {
      if (typeof data.path !== 'string') {
        const err0 = {
          instancePath: instancePath + '/path',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/path/type',
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
    if (data.targetId !== undefined) {
      let data1 = data.targetId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err1 = {
            instancePath: instancePath + '/targetId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/RedirectView/properties/targetId/format',
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
          instancePath: instancePath + '/targetId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/targetId/type',
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
    if (data.targetType !== undefined) {
      if (typeof data.targetType !== 'string') {
        const err3 = {
          instancePath: instancePath + '/targetType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/targetType/type',
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
    if (data.origin !== undefined) {
      if (typeof data.origin !== 'string') {
        const err4 = {
          instancePath: instancePath + '/origin',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/origin/type',
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
    if (data.createdAt !== undefined) {
      let data4 = data.createdAt;
      if (typeof data4 === 'string') {
        if (!formats10.validate(data4)) {
          const err5 = {
            instancePath: instancePath + '/createdAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/RedirectView/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/createdAt/type',
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
    if (data.hitCount !== undefined) {
      let data5 = data.hitCount;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err7 = {
          instancePath: instancePath + '/hitCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/hitCount/type',
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
    if (data.currentPath !== undefined) {
      if (typeof data.currentPath !== 'string') {
        const err8 = {
          instancePath: instancePath + '/currentPath',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/currentPath/type',
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
    if (data.targetLabel !== undefined) {
      if (typeof data.targetLabel !== 'string') {
        const err9 = {
          instancePath: instancePath + '/targetLabel',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/targetLabel/type',
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
    if (data.reachable !== undefined) {
      if (typeof data.reachable !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/reachable',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/RedirectView/properties/reachable/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/RedirectView/type',
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
  validate592.errors = vErrors;
  return errors === 0;
}
validate592.evaluated = {
  props: {
    path: true,
    targetId: true,
    targetType: true,
    origin: true,
    createdAt: true,
    hitCount: true,
    currentPath: true,
    targetLabel: true,
    reachable: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
