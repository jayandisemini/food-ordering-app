// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:quickbite/main.dart';

void main() {
  testWidgets('QuickBite app shell builds', (WidgetTester tester) async {
    await tester.pumpWidget(
      const QuickBiteApp(home: SizedBox(key: Key('test-home'))),
    );

    expect(find.byType(QuickBiteApp), findsOneWidget);
    expect(find.byKey(const Key('test-home')), findsOneWidget);
  });
}
