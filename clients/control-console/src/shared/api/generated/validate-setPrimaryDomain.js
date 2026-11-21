// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const setPrimaryDomainInput = validate607;
const schema726 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        siteId: { type: 'string', format: 'uuid' },
        host: { type: 'string' },
      },
      required: ['tenantId', 'siteId', 'host'],
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
  },
  required: ['path', 'header'],
  $id: 'https://edition.invalid/validators/setPrimaryDomainInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
function validate607(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/setPrimaryDomainInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate607.evaluated;
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
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.siteId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.host === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'host' },
            message: "must have required property '" + 'host' + "'",
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
        if (data0.host !== undefined) {
          if (typeof data0.host !== 'string') {
            const err9 = {
              instancePath: instancePath + '/path/host',
              schemaPath: '#/properties/path/properties/host/type',
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
    if (data.header !== undefined) {
      let data4 = data.header;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4['Idempotency-Key'] === undefined) {
          const err11 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        if (data4['Idempotency-Key'] !== undefined) {
          let data5 = data4['Idempotency-Key'];
          if (typeof data5 === 'string') {
            if (func1(data5) > 128) {
              const err12 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (func1(data5) < 1) {
              const err13 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
            if (!pattern4.test(data5)) {
              const err14 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
          } else {
            const err15 = {
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
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
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    }
  } else {
    const err17 = {
      instancePath,
      schemaPath: '#/type',
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
  validate607.errors = vErrors;
  return errors === 0;
}
validate607.evaluated = {
  props: { path: true, header: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const setPrimaryDomainOutput = validate608;
const schema727 = {
  $ref: 'https://edition.invalid/control#/components/schemas/DomainDetail',
  $id: 'https://edition.invalid/validators/setPrimaryDomainOutput',
};
const schema718 = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    verified: { type: 'boolean' },
    isPrimary: { type: 'boolean' },
    dnsToken: { type: 'string' },
    txtName: { type: 'string' },
    txtValue: { type: 'string' },
  },
  required: [
    'dnsToken',
    'host',
    'isPrimary',
    'txtName',
    'txtValue',
    'verified',
  ],
};
function validate608(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/setPrimaryDomainOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate608.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.dnsToken === undefined) {
      const err0 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'dnsToken' },
        message: "must have required property '" + 'dnsToken' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.host === undefined) {
      const err1 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'host' },
        message: "must have required property '" + 'host' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.isPrimary === undefined) {
      const err2 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'isPrimary' },
        message: "must have required property '" + 'isPrimary' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.txtName === undefined) {
      const err3 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'txtName' },
        message: "must have required property '" + 'txtName' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.txtValue === undefined) {
      const err4 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'txtValue' },
        message: "must have required property '" + 'txtValue' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.verified === undefined) {
      const err5 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'verified' },
        message: "must have required property '" + 'verified' + "'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.host !== undefined) {
      if (typeof data.host !== 'string') {
        const err6 = {
          instancePath: instancePath + '/host',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/host/type',
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
    if (data.verified !== undefined) {
      if (typeof data.verified !== 'boolean') {
        const err7 = {
          instancePath: instancePath + '/verified',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/verified/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.isPrimary !== undefined) {
      if (typeof data.isPrimary !== 'boolean') {
        const err8 = {
          instancePath: instancePath + '/isPrimary',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/isPrimary/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.dnsToken !== undefined) {
      if (typeof data.dnsToken !== 'string') {
        const err9 = {
          instancePath: instancePath + '/dnsToken',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/dnsToken/type',
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
    if (data.txtName !== undefined) {
      if (typeof data.txtName !== 'string') {
        const err10 = {
          instancePath: instancePath + '/txtName',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/txtName/type',
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
    if (data.txtValue !== undefined) {
      if (typeof data.txtValue !== 'string') {
        const err11 = {
          instancePath: instancePath + '/txtValue',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/txtValue/type',
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
  } else {
    const err12 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/DomainDetail/type',
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
  validate608.errors = vErrors;
  return errors === 0;
}
validate608.evaluated = {
  props: {
    host: true,
    verified: true,
    isPrimary: true,
    dnsToken: true,
    txtName: true,
    txtValue: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const setPrimaryDomainOutputFull = validate609;
const schema729 = {
  $ref: 'https://edition.invalid/control#/components/schemas/DomainDetail',
  $id: 'https://edition.invalid/validators/setPrimaryDomainOutputFull',
};
function validate609(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/setPrimaryDomainOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate609.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.dnsToken === undefined) {
      const err0 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'dnsToken' },
        message: "must have required property '" + 'dnsToken' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.host === undefined) {
      const err1 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'host' },
        message: "must have required property '" + 'host' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.isPrimary === undefined) {
      const err2 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'isPrimary' },
        message: "must have required property '" + 'isPrimary' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.txtName === undefined) {
      const err3 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'txtName' },
        message: "must have required property '" + 'txtName' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.txtValue === undefined) {
      const err4 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'txtValue' },
        message: "must have required property '" + 'txtValue' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.verified === undefined) {
      const err5 = {
        instancePath,
        schemaPath:
          'https://edition.invalid/control#/components/schemas/DomainDetail/required',
        keyword: 'required',
        params: { missingProperty: 'verified' },
        message: "must have required property '" + 'verified' + "'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.host !== undefined) {
      if (typeof data.host !== 'string') {
        const err6 = {
          instancePath: instancePath + '/host',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/host/type',
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
    if (data.verified !== undefined) {
      if (typeof data.verified !== 'boolean') {
        const err7 = {
          instancePath: instancePath + '/verified',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/verified/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.isPrimary !== undefined) {
      if (typeof data.isPrimary !== 'boolean') {
        const err8 = {
          instancePath: instancePath + '/isPrimary',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/isPrimary/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.dnsToken !== undefined) {
      if (typeof data.dnsToken !== 'string') {
        const err9 = {
          instancePath: instancePath + '/dnsToken',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/dnsToken/type',
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
    if (data.txtName !== undefined) {
      if (typeof data.txtName !== 'string') {
        const err10 = {
          instancePath: instancePath + '/txtName',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/txtName/type',
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
    if (data.txtValue !== undefined) {
      if (typeof data.txtValue !== 'string') {
        const err11 = {
          instancePath: instancePath + '/txtValue',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/DomainDetail/properties/txtValue/type',
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
  } else {
    const err12 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/DomainDetail/type',
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
  validate609.errors = vErrors;
  return errors === 0;
}
validate609.evaluated = {
  props: {
    host: true,
    verified: true,
    isPrimary: true,
    dnsToken: true,
    txtName: true,
    txtValue: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
