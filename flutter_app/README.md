# QuickBite — Flutter

Fast. Fresh. Delivered.

## Run

```
flutter create .
flutter pub get
flutter run
```

## Structure

```
lib/
  main.dart
  core/localization/        Language provider + dictionaries (en, si, ta)
  data/                     Mock food catalog
  state/                    Cart ChangeNotifier
  presentation/
    navigation/             Bottom navigation shell
    screens/                Home, Search, Orders, Favorites, Profile, Cart
    widgets/                Reusable food card
```

Switch language from Profile → Language. All screens rebuild reactively.
