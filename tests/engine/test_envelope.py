import custom_components.activity_levels.engine as engine


def test_package_imports() -> None:
    assert engine.__doc__ is not None
