import sys
import unittest

from space_vfs.identity import FAMILY, RUNTIME, client_header, package_version, user_agent


class IdentityTest(unittest.TestCase):
    def test_family_and_version_are_fixed_tokens(self):
        version = package_version()
        python = f"{sys.version_info.major}.{sys.version_info.minor}"
        self.assertRegex(version, r"^[0-9]+\.[0-9]+\.[0-9]+")
        self.assertEqual(FAMILY, "space-vfs")
        self.assertEqual(user_agent(), f"{FAMILY}/{version} {RUNTIME}/{python}")
        self.assertEqual(client_header(), f"family={FAMILY}; ver={version}; runtime={RUNTIME}")
