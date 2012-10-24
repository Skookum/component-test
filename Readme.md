# Express App - Components

A simple app with sign-in and dashboard views.

## Concepts

- **App-specific features are [components](/Skookum/component-test/tree/master/components)**
- **Everything that could be made into an npm module is in [lib](/Skookum/component-test/tree/master/lib)**
- **Shared code lives in [shared](/Skookum/component-test/tree/master/shared)**
- **Pyramid testing** (view integrations live in [shared/test](/Skookum/component-test/tree/master/shared/test), model and controller tests live in [components/{component}/test](/Skookum/component-test/tree/master/components/users/test))
- **[Makefile](/Skookum/component-test/tree/master/Makefile) as entry point** (everything starts with `make`)
- **Separate code and [config](/Skookum/component-test/tree/master/package.json)** (`config` [is injected](/Skookum/component-test/tree/master/app.js#L20) into `main()`) ...and other 12-factor guidelines

## Try it

```
$ git clone git://github.com/Skookum/component-test.git
$ cd component-test
$ make setup
$ make test-quick
$ make open
```

## Inspired by

- http://tjholowaychuk.com/post/27984551477/components
- http://blog.izs.me/post/27987129912/tj-holowaychuk-components
- http://skookum.com/blog/re-components-in-practice/
