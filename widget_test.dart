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
