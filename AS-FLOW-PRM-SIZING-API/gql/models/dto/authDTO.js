'use strict';

const toAuthUserDTO = (user) => ({
    id: String(user?.Id ?? user?.id ?? ''),
    name: user?.Name ?? user?.name ?? '',
    email: user?.Email ?? user?.email ?? '',
    appType: user?.AppType ?? user?.apptype ?? null,
});

module.exports = {
    toAuthUserDTO,
};
