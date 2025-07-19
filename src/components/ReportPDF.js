import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  section: { marginBottom: 15 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  content: { fontSize: 12, lineHeight: 1.5 }
});

const ReportPDF = ({ analysis, userInfo }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Organizational Health Assessment</Text>
        <Text style={styles.content}>Organization: {userInfo.organization}</Text>
        <Text style={styles.content}>Date: {new Date().toLocaleDateString()}</Text>
      </View>
      
      {analysis.split('\n\n').map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.content}>{section}</Text>
        </View>
      ))}
      
      <View style={styles.section}>
        <Text style={styles.heading}>Recommended Actions</Text>
        <Text style={styles.content}>
          1. Schedule consultation within 30 days{"\n"}
          2. Prioritize high-impact workflow improvements{"\n"}
          3. Establish quarterly review cadence
        </Text>
      </View>
    </Page>
  </Document>
);

export default ReportPDF;