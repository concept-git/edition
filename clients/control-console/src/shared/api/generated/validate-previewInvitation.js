// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const previewInvitationInput = validate1452;
const schema1593 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { token: { type: 'string' } },
      required: ['token'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/previewInvitationInput',
};
const func1 = ucs2Length;
function validate1452(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/previewInvitationInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1452.evaluated;
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
        if (data0.token === undefined) {
          const err1 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'token' },
            message: "must have required property '" + 'token' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.token !== undefined) {
          if (typeof data0.token !== 'string') {
            const err2 = {
              instancePath: instancePath + '/path/token',
              schemaPath: '#/properties/path/properties/token/type',
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
      } else {
        const err3 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.query !== undefined) {
      let data2 = data.query;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.fields !== undefined) {
          let data3 = data2.fields;
          if (typeof data3 === 'string') {
            if (func1(data3) > 4096) {
              const err4 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (func1(data3) < 1) {
              const err5 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate1452.errors = vErrors;
  return errors === 0;
}
validate1452.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const previewInvitationOutput = validate1453;
const schema1594 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/InvitePreview',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialInvitePreview',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/previewInvitationOutput',
};
const schema1595 = {
  type: 'object',
  properties: {
    kind: { type: 'string' },
    tenant: { $ref: '#/components/schemas/InviteGroup' },
    team: { $ref: '#/components/schemas/InviteGroup' },
    email: { type: 'string' },
    role: { type: 'string' },
    expiresAt: { type: 'string', format: 'date-time' },
  },
};
const schema875 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
  },
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate1454(
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
  const evaluated0 = validate1454.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.kind !== undefined) {
      if (typeof data.kind !== 'string') {
        const err0 = {
          instancePath: instancePath + '/kind',
          schemaPath: '#/properties/kind/type',
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
    if (data.tenant !== undefined) {
      let data1 = data.tenant;
      if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
        if (data1.id !== undefined) {
          let data2 = data1.id;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err1 = {
                instancePath: instancePath + '/tenant/id',
                schemaPath:
                  '#/components/schemas/InviteGroup/properties/id/format',
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
              instancePath: instancePath + '/tenant/id',
              schemaPath: '#/components/schemas/InviteGroup/properties/id/type',
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
        if (data1.name !== undefined) {
          if (typeof data1.name !== 'string') {
            const err3 = {
              instancePath: instancePath + '/tenant/name',
              schemaPath:
                '#/components/schemas/InviteGroup/properties/name/type',
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
      } else {
        const err4 = {
          instancePath: instancePath + '/tenant',
          schemaPath: '#/components/schemas/InviteGroup/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.team !== undefined) {
      let data4 = data.team;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.id !== undefined) {
          let data5 = data4.id;
          if (typeof data5 === 'string') {
            if (!formats0.test(data5)) {
              const err5 = {
                instancePath: instancePath + '/team/id',
                schemaPath:
                  '#/components/schemas/InviteGroup/properties/id/format',
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
              instancePath: instancePath + '/team/id',
              schemaPath: '#/components/schemas/InviteGroup/properties/id/type',
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
        if (data4.name !== undefined) {
          if (typeof data4.name !== 'string') {
            const err7 = {
              instancePath: instancePath + '/team/name',
              schemaPath:
                '#/components/schemas/InviteGroup/properties/name/type',
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
      } else {
        const err8 = {
          instancePath: instancePath + '/team',
          schemaPath: '#/components/schemas/InviteGroup/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.email !== undefined) {
      if (typeof data.email !== 'string') {
        const err9 = {
          instancePath: instancePath + '/email',
          schemaPath: '#/properties/email/type',
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
    if (data.role !== undefined) {
      if (typeof data.role !== 'string') {
        const err10 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/type',
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
    if (data.expiresAt !== undefined) {
      let data9 = data.expiresAt;
      if (typeof data9 === 'string') {
        if (!formats10.validate(data9)) {
          const err11 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath: '#/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/expiresAt',
          schemaPath: '#/properties/expiresAt/type',
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
  validate1454.errors = vErrors;
  return errors === 0;
}
validate1454.evaluated = {
  props: {
    kind: true,
    tenant: true,
    team: true,
    email: true,
    role: true,
    expiresAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1598 = {
  type: 'object',
  properties: {
    kind: { type: 'string' },
    tenant: { $ref: '#/components/schemas/PartialInviteGroup' },
    team: { $ref: '#/components/schemas/PartialInviteGroup' },
    email: { type: 'string' },
    role: { type: 'string' },
    expiresAt: { type: 'string', format: 'date-time' },
  },
};
const schema1599 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
  },
};
function validate1456(
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
  const evaluated0 = validate1456.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.kind !== undefined) {
      if (typeof data.kind !== 'string') {
        const err0 = {
          instancePath: instancePath + '/kind',
          schemaPath: '#/properties/kind/type',
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
    if (data.tenant !== undefined) {
      let data1 = data.tenant;
      if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
        if (data1.id !== undefined) {
          let data2 = data1.id;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err1 = {
                instancePath: instancePath + '/tenant/id',
                schemaPath:
                  '#/components/schemas/PartialInviteGroup/properties/id/format',
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
              instancePath: instancePath + '/tenant/id',
              schemaPath:
                '#/components/schemas/PartialInviteGroup/properties/id/type',
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
        if (data1.name !== undefined) {
          if (typeof data1.name !== 'string') {
            const err3 = {
              instancePath: instancePath + '/tenant/name',
              schemaPath:
                '#/components/schemas/PartialInviteGroup/properties/name/type',
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
      } else {
        const err4 = {
          instancePath: instancePath + '/tenant',
          schemaPath: '#/components/schemas/PartialInviteGroup/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.team !== undefined) {
      let data4 = data.team;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.id !== undefined) {
          let data5 = data4.id;
          if (typeof data5 === 'string') {
            if (!formats0.test(data5)) {
              const err5 = {
                instancePath: instancePath + '/team/id',
                schemaPath:
                  '#/components/schemas/PartialInviteGroup/properties/id/format',
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
              instancePath: instancePath + '/team/id',
              schemaPath:
                '#/components/schemas/PartialInviteGroup/properties/id/type',
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
        if (data4.name !== undefined) {
          if (typeof data4.name !== 'string') {
            const err7 = {
              instancePath: instancePath + '/team/name',
              schemaPath:
                '#/components/schemas/PartialInviteGroup/properties/name/type',
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
      } else {
        const err8 = {
          instancePath: instancePath + '/team',
          schemaPath: '#/components/schemas/PartialInviteGroup/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.email !== undefined) {
      if (typeof data.email !== 'string') {
        const err9 = {
          instancePath: instancePath + '/email',
          schemaPath: '#/properties/email/type',
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
    if (data.role !== undefined) {
      if (typeof data.role !== 'string') {
        const err10 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/type',
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
    if (data.expiresAt !== undefined) {
      let data9 = data.expiresAt;
      if (typeof data9 === 'string') {
        if (!formats10.validate(data9)) {
          const err11 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath: '#/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/expiresAt',
          schemaPath: '#/properties/expiresAt/type',
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
  validate1456.errors = vErrors;
  return errors === 0;
}
validate1456.evaluated = {
  props: {
    kind: true,
    tenant: true,
    team: true,
    email: true,
    role: true,
    expiresAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1453(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/previewInvitationOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1453.evaluated;
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
    !validate1454(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1454.errors
        : vErrors.concat(validate1454.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.kind = true;
    props0.tenant = true;
    props0.team = true;
    props0.email = true;
    props0.role = true;
    props0.expiresAt = true;
  }
  const _errs2 = errors;
  if (
    !validate1456(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1456.errors
        : vErrors.concat(validate1456.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.kind = true;
      props0.tenant = true;
      props0.team = true;
      props0.email = true;
      props0.role = true;
      props0.expiresAt = true;
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
  validate1453.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1453.evaluated = { dynamicProps: true, dynamicItems: false };
export const previewInvitationOutputFull = validate1458;
const schema1601 = {
  $ref: 'https://edition.invalid/control#/components/schemas/InvitePreview',
  $id: 'https://edition.invalid/validators/previewInvitationOutputFull',
};
function validate1459(
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
  const evaluated0 = validate1459.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.kind !== undefined) {
      if (typeof data.kind !== 'string') {
        const err0 = {
          instancePath: instancePath + '/kind',
          schemaPath: '#/properties/kind/type',
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
    if (data.tenant !== undefined) {
      let data1 = data.tenant;
      if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
        if (data1.id !== undefined) {
          let data2 = data1.id;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err1 = {
                instancePath: instancePath + '/tenant/id',
                schemaPath:
                  '#/components/schemas/InviteGroup/properties/id/format',
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
              instancePath: instancePath + '/tenant/id',
              schemaPath: '#/components/schemas/InviteGroup/properties/id/type',
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
        if (data1.name !== undefined) {
          if (typeof data1.name !== 'string') {
            const err3 = {
              instancePath: instancePath + '/tenant/name',
              schemaPath:
                '#/components/schemas/InviteGroup/properties/name/type',
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
      } else {
        const err4 = {
          instancePath: instancePath + '/tenant',
          schemaPath: '#/components/schemas/InviteGroup/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.team !== undefined) {
      let data4 = data.team;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.id !== undefined) {
          let data5 = data4.id;
          if (typeof data5 === 'string') {
            if (!formats0.test(data5)) {
              const err5 = {
                instancePath: instancePath + '/team/id',
                schemaPath:
                  '#/components/schemas/InviteGroup/properties/id/format',
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
              instancePath: instancePath + '/team/id',
              schemaPath: '#/components/schemas/InviteGroup/properties/id/type',
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
        if (data4.name !== undefined) {
          if (typeof data4.name !== 'string') {
            const err7 = {
              instancePath: instancePath + '/team/name',
              schemaPath:
                '#/components/schemas/InviteGroup/properties/name/type',
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
      } else {
        const err8 = {
          instancePath: instancePath + '/team',
          schemaPath: '#/components/schemas/InviteGroup/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.email !== undefined) {
      if (typeof data.email !== 'string') {
        const err9 = {
          instancePath: instancePath + '/email',
          schemaPath: '#/properties/email/type',
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
    if (data.role !== undefined) {
      if (typeof data.role !== 'string') {
        const err10 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/type',
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
    if (data.expiresAt !== undefined) {
      let data9 = data.expiresAt;
      if (typeof data9 === 'string') {
        if (!formats10.validate(data9)) {
          const err11 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath: '#/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/expiresAt',
          schemaPath: '#/properties/expiresAt/type',
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
  validate1459.errors = vErrors;
  return errors === 0;
}
validate1459.evaluated = {
  props: {
    kind: true,
    tenant: true,
    team: true,
    email: true,
    role: true,
    expiresAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1458(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/previewInvitationOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1458.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1459(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1459.errors
        : vErrors.concat(validate1459.errors);
    errors = vErrors.length;
  }
  validate1458.errors = vErrors;
  return errors === 0;
}
validate1458.evaluated = {
  props: {
    kind: true,
    tenant: true,
    team: true,
    email: true,
    role: true,
    expiresAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
