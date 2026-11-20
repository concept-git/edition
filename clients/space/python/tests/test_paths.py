import unittest

from space_vfs.paths import children, normalize, validate


class PathTest(unittest.TestCase):
    def test_rejects_dot_segments_and_empty_parts(self):
        for path in ("", "pages", "/../secret", "/pages//x", "/pages/./x", "/pages/foo/", "\\x"):
            with self.subTest(path=path):
                with self.assertRaises(ValueError):
                    validate(path)

    def test_root_and_page_paths(self):
        self.assertEqual(normalize("/"), "/")
        self.assertEqual(normalize("page-0.md"), "/page-0.md")

    def test_children_are_one_level_and_ignore_toc(self):
        entries = [
            {"path": "/"},
            {"path": "/page-0"},
            {"path": "/page-0.md"},
            {"path": "/page-0/attachments"},
            {"path": "/page-0/attachments/sample.png"},
            {"path": "/hidden.md"},
        ]
        self.assertEqual(children(entries, "/"), ["page-0", "page-0.md", "hidden.md"])
        self.assertEqual(children(entries, "/page-0"), ["attachments"])
        self.assertEqual(children(entries, "/page-0/attachments"), ["sample.png"])


if __name__ == "__main__":
    unittest.main()
