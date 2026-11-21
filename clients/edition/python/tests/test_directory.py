import unittest

from edition_vfs import children, normalize


class MountedDirectoryTest(unittest.TestCase):
    def test_directory_lists_immediate_children_once_without_neighboring_mounts(self):
        entries = ["/api/v1/start.md", "/api/v1/end.md", "/api/readme.md", "/api-old/private.md"]
        self.assertEqual(children(entries, "/api/"), ["v1", "readme.md"])

    def test_parent_traversal_is_rejected(self):
        with self.assertRaises(ValueError):
            normalize("/guides/../private.md")
