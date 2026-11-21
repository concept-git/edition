// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const acceptInvitationInput = validate762;
const schema872 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { token: { type: 'string' } },
      required: ['token'],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/acceptInvitationInput',
};
function validate762(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/acceptInvitationInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate762.evaluated;
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
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
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
  validate762.errors = vErrors;
  return errors === 0;
}
validate762.evaluated = {
  props: { path: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const acceptInvitationOutput = validate763;
const schema873 = {
  $ref: 'https://edition.invalid/control#/components/schemas/InvitationAcceptance',
  $id: 'https://edition.invalid/validators/acceptInvitationOutput',
};
const schema874 = {
  type: 'object',
  properties: {
    kind: { type: 'string' },
    tenant: { $ref: '#/components/schemas/InviteGroup' },
    team: { $ref: '#/components/schemas/InviteGroup' },
    role: { type: 'string' },
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
function validate764(
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
  const evaluated0 = validate764.evaluated;
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
    if (data.role !== undefined) {
      if (typeof data.role !== 'string') {
        const err9 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate764.errors = vErrors;
  return errors === 0;
}
validate764.evaluated = {
  props: { kind: true, tenant: true, team: true, role: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate763(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/acceptInvitationOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate763.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate764(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate764.errors
        : vErrors.concat(validate764.errors);
    errors = vErrors.length;
  }
  validate763.errors = vErrors;
  return errors === 0;
}
validate763.evaluated = {
  props: { kind: true, tenant: true, team: true, role: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const acceptInvitationOutputFull = validate766;
const schema877 = {
  $ref: 'https://edition.invalid/control#/components/schemas/InvitationAcceptance',
  $id: 'https://edition.invalid/validators/acceptInvitationOutputFull',
};
function validate767(
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
  const evaluated0 = validate767.evaluated;
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
    if (data.role !== undefined) {
      if (typeof data.role !== 'string') {
        const err9 = {
          instancePath: instancePath + '/role',
          schemaPath: '#/properties/role/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate767.errors = vErrors;
  return errors === 0;
}
validate767.evaluated = {
  props: { kind: true, tenant: true, team: true, role: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate766(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/acceptInvitationOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate766.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate767(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate767.errors
        : vErrors.concat(validate767.errors);
    errors = vErrors.length;
  }
  validate766.errors = vErrors;
  return errors === 0;
}
validate766.evaluated = {
  props: { kind: true, tenant: true, team: true, role: true },
  dynamicProps: false,
  dynamicItems: false,
};
